/**
 * Native, reversible window-scroll choreography.
 * Call initScrollScenes() once, after the three featured cards are rendered.
 * Load motion-scenes.css after styles.css. No wheel/touch interception.
 * QA: every scene exposes data-scene-progress (0..1); actors expose
 * data-scroll-progress and CSS --scene-y / --scene-opacity values.
 */
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => value * value * (3 - 2 * value);
const topInDocument = element => {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
};

export function initScrollScenes() {
  const root = document.documentElement;
  if (root.dataset.scrollScenes) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  root.dataset.scrollScenes = 'ready';
  const compactIntro = hero.classList.contains('dual-intro');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px)');
  const records = [];
  let frame = 0, measureNeeded = true, height = innerHeight, headerHeight = 0;
  let heroTop = 0, heroRange = 1, storyTop = 0, storyHeight = 1;
  let projectTop = 0, projectHeight = 1;
  let heroFooterTop = 0, heroFooterHeight = 1;
  let stackTop = 0, stackHeight = 1;
  const stackStrip = document.querySelector('.stack-strip');
  const stackItems = [...(stackStrip?.querySelectorAll('.wrap > span') || [])];

  // Move existing nodes, rather than cloning content or replacing controls.
  // All IDs, event handlers, focus targets, and hash links retain their identity.
  const heroFooter = hero.querySelector('.hero-bottom');
  const stage = document.createElement('div');
  stage.className = 'motion-hero-stage';
  while (hero.firstChild) stage.append(hero.firstChild);
  const track = document.createElement('div');
  track.className = 'motion-hero-track';
  track.append(stage);
  hero.append(track);
  // The chapter footer belongs to document flow, outside the sticky scene.
  // Its original node and text are retained, with no duplicate heading.
  if (heroFooter) hero.append(heroFooter);
  hero.classList.add('motion-hero');

  const projectSection = document.querySelector('.projects');
  const projectHeading = projectSection?.querySelector('.section-heading');
  const featuredHeading = projectSection?.querySelector('.featured-heading');
  const featuredGrid = projectSection?.querySelector('.featured-grid');
  let projectScene;
  if (projectHeading && featuredHeading && featuredGrid) {
    projectScene = document.createElement('div');
    projectScene.className = 'motion-project-scene';
    const cards = document.createElement('div');
    cards.className = 'motion-project-cards';
    projectHeading.before(projectScene);
    cards.append(featuredHeading, featuredGrid);
    projectScene.append(projectHeading, cards);
  }

  const story = document.querySelector('.automation-story');
  const steps = [...document.querySelectorAll('.automation-step')];
  const storyCounter = story?.querySelector('.flow-step');
  const about = document.querySelector('.about-grid');
  about?.classList.add('motion-about-scene');

  // Inline wrappers keep real, selectable text and its original reading order.
  // Whitespace is left as text, so wrapping and accessible names stay natural.
  function wordsIn(element) {
    if (!element) return [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode);
    const words = [];
    textNodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part.trim()) fragment.append(document.createTextNode(part));
        else {
          const span = document.createElement('span');
          span.className = 'scene-word';
          span.textContent = part;
          fragment.append(span);
          words.push(span);
        }
      });
      node.replaceWith(fragment);
    });
    return words;
  }
  const heroWords = wordsIn(hero.querySelector('h1'));
  const contact = document.querySelector('.contact');
  const contactWords = wordsIn(contact?.querySelector('h2'));

  function actor(element, options = {}) {
    if (!element) return;
    element.classList.remove('reveal');
    element.classList.add('scene-actor', 'visible');
    records.push({ element, top: 0, height: 1, travel: 64, opacity: .76, ...options });
  }
  // The pinned titles remain legible while their companions move past them.
  steps.forEach((element, index) => actor(element, { travel: 84, opacity: .72, step: index }));
  document.querySelectorAll('.featured-card').forEach((element, index) => actor(element, { travel: 70 + index * 12, opacity: .84 }));
  document.querySelectorAll('.sample-section .section-heading, .approach, .offline-section').forEach(element => actor(element, { travel: 48, opacity: .87 }));
  actor(about?.querySelector('.about-detail'), { travel: 65, opacity: .86 });
  actor(contact, { travel: 68, opacity: .9 });
  // Neutralize legacy one-shot reveal classes on pinned containers as well.
  document.querySelectorAll('.section-heading, .about-grid').forEach(element => element.classList.remove('reveal'));

  function measure() {
    height = innerHeight;
    const reduced = preference.matches;
    const mobile = compact.matches;
    const header = document.querySelector('.header');
    const configuredHeader = parseFloat(getComputedStyle(root).getPropertyValue('--header-height')) || 0;
    headerHeight = header && getComputedStyle(header).position === 'fixed' ? header.offsetHeight : configuredHeader;
    const availableHeight = Math.max(1, height - headerHeight);
    hero.style.setProperty('--scene-header-height', headerHeight + 'px');
    root.classList.toggle('scroll-scenes-reduced', reduced);
    root.classList.toggle('scroll-scenes-mobile', mobile);
    // A small screen gets natural flow with only modest parallax: no tall
    // pinned panel can trap its controls outside the available viewport.
    let canPin = !compactIntro && !reduced && !mobile && availableHeight >= 650;
    root.classList.toggle('scroll-scenes-pinned', canPin);
    hero.style.removeProperty('--hero-scene-height');
    hero.style.removeProperty('--hero-stage-height');
    const copy = hero.querySelector('.hero-copy');
    const contentHeight = Math.max(copy?.offsetHeight || 0, 620);
    // Browser zoom / larger text can make a scene taller than its screen.
    // Prefer ordinary document flow rather than pinning unreachable controls.
    canPin = canPin && contentHeight <= availableHeight;
    root.classList.toggle('scroll-scenes-pinned', canPin);
    const stageHeight = Math.max(contentHeight, Math.min(availableHeight, 940));
    const pinRoom = canPin ? Math.round(availableHeight * .74) : 0;
    hero.style.setProperty('--hero-stage-height', stageHeight + 'px');
    hero.style.setProperty('--hero-scene-height', stageHeight + pinRoom + 'px');
    heroTop = topInDocument(hero);
    heroRange = canPin ? pinRoom : Math.max(1, hero.offsetHeight * .75);
    if (heroFooter) {
      heroFooterTop = topInDocument(heroFooter);
      heroFooterHeight = heroFooter.offsetHeight;
    }
    if (stackStrip) {
      // Reserve real layout space for the full decorative canvas tail, plus
      // the strip's maximum upward travel. The technology text never crosses
      // the descending object, even though the object can cross the hero seam.
      const visual = hero.querySelector('.visual');
      const factor = reduced ? 0 : mobile ? .38 : 1;
      const descent = Math.min(240, Math.max(160, height * .24)) * factor;
      const visualBottom = (visual?.offsetTop || 0) + (visual?.offsetHeight || 0);
      const clearance = Math.max(0, visualBottom + descent - stage.offsetHeight - heroFooterHeight + 74 * factor + 28);
      stackStrip.style.setProperty('--stack-clearance', Math.ceil(clearance) + 'px');
      stackTop = topInDocument(stackStrip);
      stackHeight = stackStrip.offsetHeight;
    }
    records.forEach(record => {
      record.top = topInDocument(record.element);
      record.height = record.element.offsetHeight;
    });
    if (story) { storyTop = topInDocument(story); storyHeight = story.offsetHeight; }
    if (projectScene) { projectTop = topInDocument(projectScene); projectHeight = projectScene.offsetHeight; }
    measureNeeded = false;
  }

  function update() {
    frame = 0;
    if (measureNeeded) measure();
    const scroll = scrollY;
    const reduced = preference.matches;
    const mobile = compact.matches;
    const factor = reduced ? 0 : mobile ? .38 : 1;
    const heroProgress = clamp((scroll + headerHeight - heroTop) / heroRange);
    const easedHero = ease(heroProgress);
    hero.dataset.sceneProgress = heroProgress.toFixed(4);
    hero.style.setProperty('--hero-copy-y', (-112 * easedHero * factor).toFixed(2) + 'px');
    // Only the sculpture descends. Its label and pause button are siblings
    // outside the transformed canvas/fallback, anchored to the stable scene.
    const sculptureDescent = Math.min(240, Math.max(160, height * .24));
    hero.style.setProperty('--hero-visual-y', (sculptureDescent * easedHero * factor).toFixed(2) + 'px');
    hero.style.setProperty('--hero-ambient-x', (50 + 18 * easedHero * factor).toFixed(2) + '%');
    if (heroFooter) {
      // This timeline follows the footer's own passage through the viewport,
      // not the pinned hero timeline. It rises continuously in either direction.
      const progress = clamp((scroll + height - heroFooterTop) / (height + heroFooterHeight));
      const footerY = (24 - 74 * ease(progress)) * factor;
      heroFooter.dataset.sceneProgress = progress.toFixed(4);
      heroFooter.style.setProperty('--footer-text-y', footerY.toFixed(2) + 'px');
      heroFooter.style.setProperty('--footer-text-opacity', (reduced ? 1 : .74 + .26 * ease(clamp(progress / .32))).toFixed(4));
    }
    if (stackStrip) {
      // A separate document-flow passage: emerge, stay readable, then leave.
      // Only decorative paint and inline content move; the strip never pins.
      const progress = clamp((scroll + height - stackTop) / (height + stackHeight));
      const arrival = ease(clamp(progress / .24));
      const departure = 1 - ease(clamp((progress - .73) / .27));
      const rise = (40 - 98 * ease(progress)) * factor;
      stackStrip.dataset.sceneProgress = progress.toFixed(4);
      stackStrip.style.setProperty('--stack-y', rise.toFixed(2) + 'px');
      stackStrip.style.setProperty('--stack-opacity', (reduced ? 1 : arrival * departure).toFixed(4));
      stackItems.forEach((item, index) => {
        const local = clamp((progress - index * .012) / (1 - index * .012));
        item.dataset.scrollProgress = local.toFixed(4);
        item.style.setProperty('--stack-item-y', ((18 - 34 * ease(local)) * factor).toFixed(2) + 'px');
        item.style.setProperty('--stack-item-opacity', (reduced ? 1 : .7 + .3 * ease(clamp(local / .24))).toFixed(4));
      });
    }
    heroWords.forEach((word, index) => {
      const local = ease(clamp(heroProgress * 1.16 - index * .035));
      word.style.setProperty('--word-y', (-local * (14 + index * 2.7) * factor).toFixed(2) + 'px');
      word.style.setProperty('--word-opacity', (1 - local * .16 * factor).toFixed(3));
    });
    let active = 0;
    records.forEach(record => {
      const progress = clamp((scroll + height - record.top) / (height + record.height));
      // Full visibility through the reading zone; gentle dimming only at edges.
      const reading = clamp(Math.min(progress / .28, (1 - progress) / .15));
      const y = record.travel * (1 - progress * 2) * factor;
      const opacity = reduced ? 1 : record.opacity + (1 - record.opacity) * ease(reading);
      record.element.dataset.scrollProgress = progress.toFixed(4);
      record.element.style.setProperty('--scene-y', y.toFixed(2) + 'px');
      record.element.style.setProperty('--scene-opacity', opacity.toFixed(4));
      if (record.step !== undefined && record.top <= scroll + height * .62) active = record.step;
      if (record.element === contact) {
        contact.dataset.sceneProgress = progress.toFixed(4);
        contactWords.forEach((word, index) => {
          const arrival = ease(clamp((progress - index * .016) / .48));
          word.style.setProperty('--word-y', ((1 - arrival) * 25 * factor).toFixed(2) + 'px');
          word.style.setProperty('--word-opacity', (reduced ? 1 : .82 + .18 * arrival).toFixed(3));
        });
      }
    });
    if (story) {
      const progress = clamp((scroll + height * .35 - storyTop) / Math.max(1, storyHeight - height * .65));
      story.dataset.sceneProgress = progress.toFixed(4);
      story.dataset.active = String(active);
      story.style.setProperty('--flow-progress', reduced ? '1' : progress.toFixed(5));
      story.style.setProperty('--story-title-y', (-18 * progress * factor).toFixed(2) + 'px');
      steps.forEach((step, index) => step.classList.toggle('is-current', index === active));
      if (storyCounter) storyCounter.textContent = '0' + (active + 1) + ' / 03';
    }
    if (projectScene) {
      const progress = clamp((scroll + height * .3 - projectTop) / Math.max(1, projectHeight - height * .5));
      projectScene.dataset.sceneProgress = progress.toFixed(4);
      projectScene.style.setProperty('--chapter-title-y', (-24 * progress * factor).toFixed(2) + 'px');
    }
  }
  function queue() { if (!frame) frame = requestAnimationFrame(update); }
  function refresh() { measureNeeded = true; queue(); }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', refresh, { passive: true });
  addEventListener('pageshow', refresh);
  addEventListener('load', refresh, { once: true });
  preference.addEventListener('change', refresh);
  compact.addEventListener('change', refresh);
  // Project search, fonts, image decode, and responsive game layout may move
  // later scenes. Observe layout, never loop an animation when scroll is idle.
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(refresh) : null;
  observer?.observe(document.querySelector('main') || document.body);
  document.fonts?.ready.then(refresh);
  update();
  return { refresh, destroy() {
    removeEventListener('scroll', queue);
    removeEventListener('resize', refresh);
    removeEventListener('pageshow', refresh);
    preference.removeEventListener('change', refresh);
    compact.removeEventListener('change', refresh);
    observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    root.classList.remove('scroll-scenes-pinned');
    root.classList.add('scroll-scenes-reduced');
  } };
}

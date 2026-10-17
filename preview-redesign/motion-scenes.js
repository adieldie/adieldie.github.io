/** Native document flow; optional decoration never hides or pins content. */
export function initScrollScenes() {
  const root = document.documentElement;
  if (root.dataset.scrollScenes) return;
  root.dataset.scrollScenes = 'editorial';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const ribbon = document.querySelector('[data-skill-ribbon]');
  const toggle = document.getElementById('ribbon-toggle');
  let paused = false;
  const apply = () => {
    root.classList.toggle('scroll-scenes-reduced', preference.matches);
    if (ribbon) {
      ribbon.dataset.paused = String(paused || preference.matches);
      ribbon.dataset.ready = 'true';
    }
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(paused || preference.matches));
      toggle.textContent = paused ? 'Retomar faixa' : 'Pausar faixa';
      toggle.setAttribute('aria-label', (paused ? 'Retomar' : 'Pausar') + ' movimento da faixa de competências');
    }
  };
  const onToggle = () => { paused = !paused; apply(); };
  toggle?.addEventListener('click', onToggle);
  apply();
  preference.addEventListener('change', apply);
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  return { refresh: apply, destroy() { preference.removeEventListener('change', apply); toggle?.removeEventListener('click', onToggle); } };
}

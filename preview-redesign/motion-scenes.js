/** The editorial portfolio uses native document flow throughout.
 * Animation is decorative and optional; no content is hidden or pinned. */
export function initScrollScenes() {
  const root = document.documentElement;
  if (root.dataset.scrollScenes) return;
  root.dataset.scrollScenes = 'editorial';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const apply = () => root.classList.toggle('scroll-scenes-reduced', preference.matches);
  apply();
  preference.addEventListener('change', apply);
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  return { refresh: apply, destroy() { preference.removeEventListener('change', apply); } };
}

// A local, three-way preference. No account data or network requests are used.
export const THEME_STORAGE_KEY = 'adiel-portfolio-theme';
const preferences = new Set(['system', 'light', 'dark']);
const isPreference = value => preferences.has(value);

export function initTheme() {
  const root = document.documentElement;
  if (root.dataset.themeControlReady === 'true') return;
  root.dataset.themeControlReady = 'true';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'dark';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isPreference(stored)) preference = stored;
  } catch {
    // Restricted/private storage still permits a session-only preference.
    if (isPreference(root.dataset.themePreference)) preference = root.dataset.themePreference;
  }

  const control = document.createElement('label');
  control.className = 'theme-control';
  control.htmlFor = 'theme-preference';
  const caption = document.createElement('span');
  caption.className = 'theme-control-label';
  caption.textContent = 'Tema';
  const select = document.createElement('select');
  select.id = 'theme-preference';
  select.name = 'theme';
  select.setAttribute('aria-label', 'Tema de cor');
  for (const [value, name] of [['system', 'Sistema'], ['light', 'Claro'], ['dark', 'Escuro']]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    select.append(option);
  }
  control.append(caption, select);
  const header = document.querySelector('.header');
  header?.append(control);

  const apply = () => {
    const theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    const changed = root.dataset.theme !== theme;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
    select.value = preference;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#080808' : '#f5f1eb';
    window.dispatchEvent(new CustomEvent('portfolio:themechange', { detail: { preference, theme, changed } }));
  };
  select.addEventListener('change', () => {
    if (!isPreference(select.value)) return;
    preference = select.value;
    try { localStorage.setItem(THEME_STORAGE_KEY, preference); } catch { /* Session-only is sufficient. */ }
    apply();
  });
  const onSystemChange = () => { if (preference === 'system') apply(); };
  if (media.addEventListener) media.addEventListener('change', onSystemChange);
  else media.addListener(onSystemChange);
  window.addEventListener('storage', event => {
    // A reset or a change in another tab uses the same validated preference.
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    preference = isPreference(event.newValue) ? event.newValue : 'dark';
    apply();
  });
  apply();

  // Match anchor spacing to the real header, including zoom and safe-area insets.
  if (header) {
    const measureHeader = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      if (height > 0 && root.style.getPropertyValue('--header-height') !== height + 'px') {
        root.style.setProperty('--header-height', height + 'px');
      }
    };
    measureHeader();
    if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
    else window.addEventListener('resize', measureHeader, { passive: true });
  }
}

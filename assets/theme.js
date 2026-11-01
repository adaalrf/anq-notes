(() => {
  const key = 'anq-notes-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  let transitionTimer;
  const valid = (value) => (['light', 'dark'].includes(value) ? value : 'system');
  try {
    preference = valid(localStorage.getItem(key));
  } catch {
    // The control still works for this page when storage is unavailable.
  }
  function apply() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    const root = document.documentElement;
    if (root.dataset.theme && root.dataset.theme !== theme) {
      root.classList.add('theme-changing');
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => root.classList.remove('theme-changing'), 180);
    }
    root.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.content = theme === 'dark' ? '#211b16' : '#faf7f1';
    });
    const control = document.querySelector('.theme-control');
    if (control) {
      control.setAttribute('aria-checked', String(theme === 'dark'));
      control.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }
  apply();
  system.addEventListener('change', apply);
  addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      preference = valid(event.newValue);
      apply();
    }
  });
  addEventListener('DOMContentLoaded', () => {
    const control = document.querySelector('.theme-control');
    control.hidden = false;
    apply();
    control.addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        if (preference === 'system') localStorage.removeItem(key);
        else localStorage.setItem(key, preference);
      } catch {
        // Keep the selected appearance even if persistence is blocked.
      }
      apply();
    });
  });
})();

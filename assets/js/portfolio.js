(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const updateTheme = (theme) => {
    const dark = theme === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(dark));
      themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      themeButton.title = themeButton.getAttribute('aria-label');
    }
    if (themeMeta) themeMeta.content = dark ? '#1c1915' : '#faf9f5';
  };
  updateTheme(root.dataset.theme);
  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      updateTheme(theme);
      try { localStorage.setItem('zhiyi-theme', theme); } catch (error) {}
    });
  }
  const progress = document.querySelector('.reading-progress');
  const sections = Array.from(document.querySelectorAll('.content-section[id]'));
  const sectionLinks = Array.from(document.querySelectorAll('.section-nav a[data-section]'));
  let scheduled = false;
  const updateScroll = () => {
    scheduled = false;
    const available = root.scrollHeight - window.innerHeight;
    const position = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
    if (progress) progress.style.transform = `scaleX(${position})`;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) active = section;
    }
    sectionLinks.forEach((link) => {
      if (active && link.dataset.section === active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const scheduleScroll = () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateScroll);
    }
  };
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll);
  window.addEventListener('load', scheduleScroll);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleScroll).observe(document.body);
  document.querySelectorAll('.mobile-sections a').forEach((link) => {
    link.addEventListener('click', () => {
      link.closest('details').open = false;
    });
  });
  document.querySelectorAll('.copy-citation').forEach((button) => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    button.hidden = false;
    button.addEventListener('click', async () => {
      const container = button.closest('.citation-content');
      const status = container.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText(container.querySelector('code').textContent.trim());
        status.textContent = 'Citation copied.';
      } catch (error) {
        status.textContent = 'Copy unavailable. Select and copy the citation above.';
      }
    });
  });
  const visitorMap = document.querySelector('.visitor-map');
  if (visitorMap) {
    visitorMap.addEventListener('toggle', () => {
      const container = visitorMap.querySelector('[data-map-src]');
      if (!visitorMap.open || container.dataset.loaded) return;
      container.dataset.loaded = 'true';
      const script = document.createElement('script');
      script.id = 'clustrmaps';
      script.src = container.dataset.mapSrc;
      script.async = true;
      script.addEventListener('error', () => {
        container.textContent = 'The visitor map is temporarily unavailable.';
      });
      container.appendChild(script);
    });
  }
  updateScroll();
})();

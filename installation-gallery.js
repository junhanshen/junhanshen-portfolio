// Installation photographs have their own controls, separate from the artwork viewer.
document.querySelectorAll('[data-installation-gallery]').forEach(gallery => {
  const slides = [...gallery.querySelectorAll('.installation-image img')];
  const imageButton = gallery.querySelector('.installation-image');
  const previous = gallery.querySelector('.installation-prev');
  const next = gallery.querySelector('.installation-next');
  const count = gallery.querySelector('.installation-count');
  if (!slides.length || !imageButton || !previous || !next || !count) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;
  let stopped = reducedMotion.matches;
  let pointerStart = null;

  const syncLanguage = () => {
    const chinese = document.documentElement.lang.startsWith('zh');
    slides.forEach(image => {
      image.alt = chinese ? image.dataset.altZh : image.dataset.altEn;
    });
    imageButton.setAttribute('aria-label', stopped
      ? chinese ? '自动播放已暂停' : 'Slideshow paused'
      : chinese ? '暂停自动播放' : 'Pause slideshow');
    imageButton.setAttribute('aria-pressed', String(stopped));
  };

  const show = index => {
    current = (index + slides.length) % slides.length;
    slides.forEach((image, position) => { image.hidden = position !== current; });
    count.textContent = `${current + 1} / ${slides.length}`;
  };

  const clearTimer = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const stopAutoplay = () => {
    stopped = true;
    clearTimer();
    gallery.dataset.autoplay = 'paused';
    count.setAttribute('aria-live', 'polite');
    syncLanguage();
  };

  const startAutoplay = () => {
    clearTimer();
    if (stopped || document.hidden || slides.length < 2) return;
    gallery.dataset.autoplay = 'playing';
    timer = window.setInterval(() => show(current + 1), 4000);
  };

  // A visitor's interaction permanently pauses rotation for this page visit.
  gallery.addEventListener('pointerdown', stopAutoplay);
  gallery.addEventListener('click', stopAutoplay);
  gallery.addEventListener('focusin', stopAutoplay);
  previous.addEventListener('click', () => { stopAutoplay(); show(current - 1); });
  next.addEventListener('click', () => { stopAutoplay(); show(current + 1); });

  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stopAutoplay();
    show(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });

  imageButton.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  imageButton.addEventListener('pointerup', event => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(current + (dx < 0 ? 1 : -1));
    }
  });
  imageButton.addEventListener('pointercancel', () => { pointerStart = null; });

  document.querySelectorAll('.lang button').forEach(button => {
    button.addEventListener('click', syncLanguage);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimer();
    else startAutoplay();
  });
  window.addEventListener('pagehide', clearTimer);
  window.addEventListener('pageshow', startAutoplay);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) stopAutoplay();
  });

  show(0);
  syncLanguage();
  gallery.dataset.autoplay = stopped ? 'paused' : 'playing';
  startAutoplay();
});

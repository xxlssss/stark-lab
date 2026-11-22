(() => {
  const curtain = document.getElementById('intro-curtain');
  const counter = curtain.querySelector('.intro-progress span');
  const duration = 2500;
  let ready = false;
  let frame;
  let hideTimer;

  function finishLoading() {
    ready = true;
  }
  window.addEventListener('keyboard:first-frame', finishLoading, { once: true });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.back-to-top').addEventListener('click', backToTop);
    import('./keyboard.js?v=swap-icons').catch(finishLoading);
  }, { once: true });
  // Keep the site accessible if the renderer never produces a frame.
  const timeout = setTimeout(finishLoading, 15000);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let headline;
  let scale = 1;
  let scaleFrame = 0;
  let previousTime = 0;
  let scrollRange = 1;

  function paintScale(now) {
    const progress = Math.max(0, Math.min(1, window.scrollY / scrollRange));
    const target = motion.matches ? 1 : 1 - .28 * progress;
    const elapsed = previousTime ? now - previousTime : 16;
    previousTime = now;
    scale += (target - scale) * (1 - Math.exp(-elapsed / 100));
    if (motion.matches || Math.abs(target - scale) < .0002) scale = target;
    headline.style.transform = `scale(${scale})`;
    scaleFrame = scale === target ? 0 : requestAnimationFrame(paintScale);
    if (!scaleFrame) previousTime = 0;
  }

  function syncScale() {
    if (headline && !scaleFrame) scaleFrame = requestAnimationFrame(paintScale);
  }

  function measureHeadline() {
    if (!headline.getClientRects().length) return;
    const parent = headline.parentElement.getBoundingClientRect();
    scrollRange = Math.max(window.innerHeight * .45, parent.bottom + window.scrollY);
    syncScale();
  }

  document.addEventListener('DOMContentLoaded', () => {
    headline = document.getElementById('hero-title');
    headline.style.transformOrigin = 'left center';
    new ResizeObserver(measureHeadline).observe(headline.parentElement);
    measureHeadline();
  }, { once: true });
  window.addEventListener('scroll', syncScale, {passive: true});
  window.addEventListener('resize', () => { if (headline) measureHeadline(); });
  motion.addEventListener('change', syncScale);

  function backToTop() {
    document.querySelector('.site-header .brand').focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: motion.matches ? 'instant' : 'smooth'});
  }

  function showCurtain() {
    cancelAnimationFrame(frame);
    clearTimeout(hideTimer);
    curtain.classList.remove('is-leaving');
    counter.textContent = '001';
    curtain.hidden = false;
    let start;
    function advance(now) {
      start ??= now;
      const progress = Math.min(ready ? 100 : 99, 1 + Math.floor(99 * (now - start) / duration));
      counter.textContent = String(progress).padStart(3, '0');
      if (progress < 100) {
        frame = requestAnimationFrame(advance);
        return;
      }
      clearTimeout(timeout);
      frame = requestAnimationFrame(() => {
        curtain.classList.add('is-leaving');
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (headline && isHome() && !reducedMotion) {
          scale = .72;
          previousTime = now;
          headline.style.transform = 'scale(.72)';
          syncScale();
        }
        hideTimer = setTimeout(() => { curtain.hidden = true; }, reducedMotion ? 0 : 350);
      });
    }
    frame = requestAnimationFrame(advance);
  }

  const isHome = () => !location.hash || location.hash === '#home';
  window.addEventListener('hashchange', () => {
    if (isHome()) showCurtain();
  });
  // Same-hash links do not fire hashchange.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.altKey || event.shiftKey || location.hash !== '#home') return;
    if (event.target.closest('a[href="#home"]')) showCurtain();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && isHome()) showCurtain();
  });
  showCurtain();
})();

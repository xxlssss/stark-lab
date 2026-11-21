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
    import('./keyboard.js?v=section-16').catch(finishLoading);
  }, { once: true });
  // Keep the site accessible if the renderer never produces a frame.
  const timeout = setTimeout(finishLoading, 15000);

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

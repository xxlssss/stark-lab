(() => {
  const curtain = document.getElementById('intro-curtain');
  const counter = curtain.querySelector('.intro-progress span');
  const duration = 2500;
  let ready = false;
  let start;
  curtain.hidden = false;

  function finishLoading() {
    ready = true;
  }
  window.addEventListener('keyboard:first-frame', finishLoading, { once: true });
  document.addEventListener('DOMContentLoaded', () => {
    import('./keyboard.js?v=curtain-15').catch(finishLoading);
  }, { once: true });
  // Keep the site accessible if the renderer never produces a frame.
  const timeout = setTimeout(finishLoading, 15000);

  function advance(now) {
    start ??= now;
    const progress = Math.min(ready ? 100 : 99, 1 + Math.floor(99 * (now - start) / duration));
    counter.textContent = String(progress).padStart(3, '0');
    if (progress < 100) {
      requestAnimationFrame(advance);
      return;
    }
    clearTimeout(timeout);
    requestAnimationFrame(() => {
      curtain.classList.add('is-leaving');
      setTimeout(() => curtain.remove(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350);
    });
  }
  requestAnimationFrame(advance);
})();

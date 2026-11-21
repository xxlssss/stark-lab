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
    import('./keyboard.js?v=section-16').catch(finishLoading);
  }, { once: true });
  // Keep the site accessible if the renderer never produces a frame.
  const timeout = setTimeout(finishLoading, 15000);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let headlineAnimation;
  let returnFrame;
  function growHeadline(delay = 0) {
    if (motion.matches) return;
    headlineAnimation?.cancel();
    headlineAnimation = document.getElementById('hero-title')?.animate(
      [
        { transform: 'scale(.72)', transformOrigin: 'left center' },
        { transform: 'scale(1)', transformOrigin: 'left center' }
      ],
      { duration: 850, delay, easing: 'cubic-bezier(.22,.7,.25,1)', fill: 'backwards' }
    );
  }

  function backToTop() {
    cancelAnimationFrame(returnFrame);
    document.querySelector('.site-header .brand').focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: motion.matches ? 'instant' : 'smooth'});
    const deadline = performance.now() + 3000;
    function onReturn(now) {
      if (window.scrollY <= 1) growHeadline();
      else if (now < deadline) returnFrame = requestAnimationFrame(onReturn);
    }
    returnFrame = requestAnimationFrame(onReturn);
  }

  function showCurtain() {
    cancelAnimationFrame(returnFrame);
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
        if (isHome()) growHeadline(180);
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

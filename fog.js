(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let effect = null;
  function stop() {
    if (effect) { effect.destroy(); effect = null; }
  }
  function sync() {
    stop();
    if (reduced.matches || document.hidden || !window.VANTA?.FOG || !window.THREE) return;
    try {
      effect = window.VANTA.FOG({
        el: '#fog-background', THREE: window.THREE,
        mouseControls: true, touchControls: true, gyroControls: false,
        minHeight: 200, minWidth: 200,
        highlightColor: 0x00bffe, midtoneColor: 0xffffff,
        lowlightColor: 0xffffff, baseColor: 0xffffff,
        blurFactor: 0.56, speed: 1.30, zoom: 0.70,
        scale: 1.5, scaleMobile: 2
      });
    } catch (error) {
      stop();
      document.querySelector('#fog-background canvas')?.remove();
      console.warn('Animated background unavailable; using static background.');
    }
  }
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', sync);
  sync();
})();

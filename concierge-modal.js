(() => {
  const dialog = document.getElementById('concierge-dialog');
  const trigger = document.querySelector('.concierge-work-link');
  const close = dialog?.querySelector('.concierge-dialog-close');
  if (!dialog || !trigger || !close) return;
  trigger.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.showModal();
    dialog.scrollTop = 0;
    close.focus({preventScroll: true});
  });
  close.addEventListener('click', () => dialog.close());
  let outside = false;
  const isOutside = e => {
    const r = dialog.getBoundingClientRect();
    return e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
  };
  dialog.addEventListener('pointerdown', e => { outside = isOutside(e); });
  dialog.addEventListener('click', e => { if (outside && isOutside(e)) dialog.close(); outside = false; });
  dialog.addEventListener('close', () => trigger.focus({preventScroll: true}));
})();

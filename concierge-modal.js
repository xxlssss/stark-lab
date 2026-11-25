(() => {
  for (const trigger of document.querySelectorAll('.work-gallery button[aria-haspopup="dialog"][aria-controls]')) {
    const dialog = document.getElementById(trigger.getAttribute('aria-controls'));
    const close = dialog?.querySelector('.concierge-dialog-close');
    if (!dialog || !close) continue;
    const open = () => {
      if (dialog.open) return;
      dialog.showModal();
      dialog.scrollTop = 0;
      close.focus({preventScroll: true});
    };
    trigger.addEventListener('click', open);
    trigger.closest('figure')?.addEventListener('click', e => { if (!trigger.contains(e.target)) open(); });
    close.addEventListener('click', () => dialog.close());
    let outside = false;
    const isOutside = e => {
      const r = dialog.getBoundingClientRect();
      return e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
    };
    dialog.addEventListener('pointerdown', e => { outside = isOutside(e); });
    dialog.addEventListener('click', e => { if (outside && isOutside(e)) dialog.close(); outside = false; });
    dialog.addEventListener('close', () => trigger.focus({preventScroll: true}));
  }
})();

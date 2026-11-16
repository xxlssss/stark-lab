(() => {
  'use strict';
  const KEY = 'stark.analytics-consent';
  const VERSION = '2026-11-15.3';
  const NOTICE = 'мы используем cookies. подробнее — в Политике конфиденциальности.';
  const TTL = 180 * 24 * 60 * 60 * 1000;
  const COUNTER = 114258827;
  let allowed = false, started = false, script = null, previousFocus = null;
  const banner = document.querySelector('#privacy-banner');
  const status = document.querySelector('#privacy-status');
  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && saved.version === VERSION && ['accepted', 'rejected'].includes(saved.choice) && Number.isFinite(saved.time) && Date.now() >= saved.time && Date.now() - saved.time < TTL) return saved.choice;
    } catch {}
    return null;
  }
  function saveChoice(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice, version: VERSION, time: Date.now(), recordedAt: new Date().toISOString(), action: choice === 'accepted' ? 'accept-button' : 'reject-button', notice: NOTICE, policy: 'privacy.html', consentDocument: 'consent.html', consentDocumentVersion: '2026-11-15', counter: COUNTER })); return true; } catch { return false; }
  }
  function cleanAnalyticsStorage() {
    try { for (const key of Object.keys(localStorage)) if (/^_ym/.test(key)) localStorage.removeItem(key); } catch {}
    const parts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'));
    for (const item of document.cookie.split(';')) {
      const name = item.trim().split('=')[0];
      if (!/^_ym/.test(name)) continue;
      for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
    }
  }
  function loadAnalytics() {
    if (!allowed || started) return;
    started = true;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + COUNTER;
    script.onload = () => {
      if (!allowed) return;
      window.ym(COUNTER, 'init', { ssr: true, webvisor: true, clickmap: true, ecommerce: 'dataLayer', referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true });
    };
    document.head.append(script);
  }
  function showBanner() {
    previousFocus = document.activeElement;
    banner.hidden = false;
    banner.querySelector('button').focus({ preventScroll: true });
  }
  function choose(choice) {
    const wasStarted = started;
    allowed = choice === 'accepted';
    const persisted = saveChoice(choice);
    banner.hidden = true;
    status.textContent = allowed ? 'Аналитика разрешена.' : 'Аналитика отключена.';
    if (!persisted) status.textContent += ' Браузер не сохраняет выбор: он действует до закрытия страницы.';
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    if (allowed) loadAnalytics();
    else {
      try { if (wasStarted && window.ym) window.ym(COUNTER, 'destruct'); } catch {}
      script?.remove();
      cleanAnalyticsStorage();
      // Reload tears down Webvisor and any in-flight loader. Persisted rejection prevents restart.
      if (wasStarted && persisted) location.reload();
    }
  }
  document.querySelectorAll('[data-privacy-settings]').forEach(button => button.addEventListener('click', showBanner));
  banner.querySelector('[data-accept]').addEventListener('click', () => choose('accepted'));
  banner.querySelector('[data-reject]').addEventListener('click', () => choose('rejected'));
  window.addEventListener('hashchange', () => { if (allowed && started && window.ym) window.ym(COUNTER, 'hit', location.href); });
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    const choice = readChoice();
    if (choice !== 'accepted' && started) { allowed = false; location.reload(); }
    else if (choice === 'accepted') { allowed = true; banner.hidden = true; loadAnalytics(); }
    else banner.hidden = choice === 'rejected';
  });
  const choice = readChoice();
  allowed = choice === 'accepted';
  banner.hidden = choice !== null;
  if (allowed) loadAnalytics(); else cleanAnalyticsStorage();
})();

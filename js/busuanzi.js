(function () {
  var SCRIPT_SRC = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function loadBusuanzi() {
    if (document.querySelector('script[src*="busuanzi"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = SCRIPT_SRC;
    document.body.appendChild(s);
  }

  function ensureStyles() {
    if (document.getElementById('busuanzi-stats-style')) return;
    var style = document.createElement('style');
    style.id = 'busuanzi-stats-style';
    style.textContent =
      '#busuanzi-stats{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 12px;}' +
      '#busuanzi-stats [id^="busuanzi_value"]{font-variant-numeric:tabular-nums;font-weight:600;}';
    document.head.appendChild(style);
  }

  function ensureMarkup() {
    if (document.getElementById('busuanzi_value_page_pv')) return;

    var wrap = document.createElement('div');
    wrap.id = 'busuanzi-stats';
    wrap.setAttribute('aria-label', '瀏覽次數統計');
    wrap.innerHTML =
      '<span id="busuanzi_container_site_pv" style="display:none">本站總瀏覽 <span id="busuanzi_value_site_pv"></span> 次</span>' +
      '<span id="busuanzi_container_site_uv" style="display:none">本站訪客 <span id="busuanzi_value_site_uv"></span> 人</span>' +
      '<span id="busuanzi_container_page_pv" style="display:none">本頁瀏覽 <span id="busuanzi_value_page_pv"></span> 次</span>';

    var isReveal = !!(window.Reveal || document.querySelector('.reveal'));
    if (isReveal) {
      wrap.style.cssText =
        'position:fixed;bottom:28px;left:14px;z-index:40;font-size:11px;color:#94A6B8;pointer-events:none;';
      document.body.appendChild(wrap);
      return;
    }

    var footer = document.querySelector('footer');
    if (footer) {
      wrap.style.marginTop = '8px';
      footer.appendChild(wrap);
      return;
    }

    wrap.style.cssText +=
      'margin-top:24px;padding:20px 16px;text-align:center;font-size:12px;color:#71717a;border-top:1px solid #e4e4e7;';
    document.body.appendChild(wrap);
  }

  ready(function () {
    ensureStyles();
    ensureMarkup();
    loadBusuanzi();
  });
})();

(function () {
  var STORAGE_KEY = 'literature-unlocked';
  var PASSWORD = '04885356';
  var OVERLAY_ID = 'literature-gate';
  var unlockListeners = [];

  function unlocked() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setUnlocked() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {}
  }

  function isLiteratureListingPage() {
    var path = (location.pathname || '').replace(/\/+$/, '');
    return /(?:^|\/)literature\.html$/i.test(path) || /(?:^|\/)literature$/i.test(path);
  }

  function isLiteratureHref(href) {
    if (!href) return false;
    try {
      var url = new URL(href, location.href);
      return /(?:^|\/)literature\.html$/i.test(url.pathname.replace(/\/+$/, ''));
    } catch (e) {
      return false;
    }
  }

  function ensureLockStyles() {
    if (document.getElementById('literature-gate-lock-css')) return;
    var style = document.createElement('style');
    style.id = 'literature-gate-lock-css';
    style.textContent =
      'html.literature-locked,html.literature-locked body{overflow:hidden!important}' +
      'html.literature-locked body>*:not(#' + OVERLAY_ID + '){visibility:hidden!important;pointer-events:none!important}' +
      '#' + OVERLAY_ID + '{visibility:visible!important;pointer-events:auto!important;position:fixed;inset:0;z-index:9999}';
    (document.head || document.documentElement).appendChild(style);
  }

  if (!unlocked() && isLiteratureListingPage()) {
    document.documentElement.classList.add('literature-locked');
  }
  ensureLockStyles();

  function notifyUnlocked() {
    document.documentElement.classList.remove('literature-locked');
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    unlockListeners.splice(0).forEach(function (fn) {
      try { fn(); } catch (e) {}
    });
    document.dispatchEvent(new CustomEvent('literature-unlocked'));
  }

  function showError(errorEl) {
    if (!errorEl) return;
    errorEl.classList.remove('hidden');
    errorEl.removeAttribute('hidden');
  }

  function showGate(onSuccess) {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      var input = existing.querySelector('#literature-gate-input');
      if (input) input.focus();
      return;
    }

    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'literature-gate-title');
    overlay.innerHTML =
      '<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(250,250,250,0.96);backdrop-filter:blur(8px)">' +
        '<div style="width:100%;max-width:22rem;background:#fff;border:1px solid #e4e4e7;border-radius:1.5rem;padding:2rem;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.08)">' +
          '<div style="width:3rem;height:3rem;background:#ccfbf1;color:#0f766e;border-radius:1rem;display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem">' +
            '<i class="fa-solid fa-lock" style="font-size:1.15rem"></i>' +
          '</div>' +
          '<h2 id="literature-gate-title" style="font-size:1.5rem;font-weight:600;letter-spacing:-0.025em;line-height:1.2">文獻解讀</h2>' +
          '<p style="margin-top:0.5rem;font-size:0.875rem;color:#52525b">此專區需輸入密碼後才能進入。</p>' +
          '<form id="literature-gate-form" style="margin-top:1.5rem">' +
            '<label for="literature-gate-input" style="display:block;font-size:0.75rem;font-weight:500;color:#71717a;margin-bottom:0.4rem">密碼</label>' +
            '<input id="literature-gate-input" type="password" inputmode="numeric" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:100%;height:2.75rem;padding:0 1rem;border-radius:1rem;border:1px solid #e4e4e7;background:#fafafa;font-size:0.875rem;outline:none;box-sizing:border-box">' +
            '<p id="literature-gate-error" hidden style="margin-top:0.75rem;font-size:0.875rem;color:#dc2626">密碼錯誤，請再試一次。</p>' +
            '<button type="submit" style="margin-top:1rem;width:100%;height:2.75rem;border:0;border-radius:1rem;background:#0f766e;color:#fff;font-size:0.875rem;font-weight:500;cursor:pointer">進入專區</button>' +
            '<button type="button" id="literature-gate-cancel" style="margin-top:0.5rem;width:100%;height:2.75rem;border:1px solid #e4e4e7;border-radius:1rem;background:#fff;color:#3f3f46;font-size:0.875rem;font-weight:500;cursor:pointer">' +
              (isLiteratureListingPage() ? '返回首頁' : '取消') +
            '</button>' +
          '</form>' +
        '</div>' +
      '</div>';

    function mount() {
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', mount, { once: true });
        return;
      }
      if (document.getElementById(OVERLAY_ID)) return;
      document.body.appendChild(overlay);

      var form = overlay.querySelector('#literature-gate-form');
      var input = overlay.querySelector('#literature-gate-input');
      var errorEl = overlay.querySelector('#literature-gate-error');
      var cancelBtn = overlay.querySelector('#literature-gate-cancel');

      if (input) {
        input.addEventListener('focus', function () {
          input.style.borderColor = '#2dd4bf';
          input.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.25)';
          input.style.background = '#fff';
        });
        input.addEventListener('blur', function () {
          input.style.borderColor = '#e4e4e7';
          input.style.boxShadow = 'none';
          input.style.background = '#fafafa';
        });
        setTimeout(function () { input.focus(); }, 0);
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var value = (input && input.value ? input.value : '').trim();
        if (value === PASSWORD) {
          setUnlocked();
          if (typeof onSuccess === 'function') onSuccess();
          notifyUnlocked();
          return;
        }
        showError(errorEl);
        if (input) {
          input.value = '';
          input.focus();
        }
      });

      cancelBtn.addEventListener('click', function () {
        if (isLiteratureListingPage()) {
          location.href = 'index.html';
          return;
        }
        overlay.remove();
      });

      overlay.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (isLiteratureListingPage()) {
          location.href = 'index.html';
          return;
        }
        overlay.remove();
      });
    }

    mount();
  }

  function interceptLiteratureLinks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!isLiteratureHref(a.getAttribute('href'))) return;
      if (unlocked()) return;
      e.preventDefault();
      e.stopPropagation();
      showGate(function () {
        location.href = a.href;
      });
    }, true);
  }

  function boot() {
    interceptLiteratureLinks();
    if (isLiteratureListingPage() && !unlocked()) {
      showGate(null);
    }
  }

  window.LiteratureGate = {
    isUnlocked: unlocked,
    onUnlock: function (fn) {
      if (typeof fn !== 'function') return;
      if (unlocked()) fn();
      else unlockListeners.push(fn);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

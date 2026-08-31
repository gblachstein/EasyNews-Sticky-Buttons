(() => {
  const SELECTORS = {
    nzb: 'input[type="submit"][name="autoNZB"][value="NZB"]',
    zip: 'input[type="submit"][value="ZIP"]',
    uncheck: 'input[type="button"][name="off"][value="Uncheck All"]'
  };

  const DEFAULT_SETTINGS = {
    enableNZB: true,
    enableZIP: true,
    enableUncheck: true,

    sizePx: 56,
    spacingPx: 14,

    bgColor: '#0ea5e9',
    fgColor: '#ffffff',

    order: ['nzb', 'zip', 'uncheck']
  };

  const BUTTONS = {
    nzb: { id: 'easy-fab-nzb', label: 'NZB', selector: SELECTORS.nzb, key: 'enableNZB' },
    zip: { id: 'easy-fab-zip', label: 'ZIP', selector: SELECTORS.zip, key: 'enableZIP' },
    uncheck: { id: 'easy-fab-uncheck', label: 'Uncheck All', selector: SELECTORS.uncheck, key: 'enableUncheck' }
  };

  const BASE_BOTTOM = 20;
  let settings = DEFAULT_SETTINGS;
  let pollTimer = null;

  function clamp(n, min, max) {
    n = Number(n);
    if (isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function loadSettings(cb) {
    chrome.storage.local.get(DEFAULT_SETTINGS, function (items) {
      cb({
        enableNZB: !!items.enableNZB,
        enableZIP: !!items.enableZIP,
        enableUncheck: !!items.enableUncheck,
        sizePx: clamp(items.sizePx, 36, 96),
        spacingPx: clamp(items.spacingPx, 0, 80),
        bgColor: items.bgColor || DEFAULT_SETTINGS.bgColor,
        fgColor: items.fgColor || DEFAULT_SETTINGS.fgColor,
        order: Array.isArray(items.order) ? items.order : DEFAULT_SETTINGS.order
      });
    });
  }

  function applyCssVars() {
    const fontPx = clamp(Math.round(settings.sizePx * (14 / 56)), 10, 18);

    document.documentElement.style.setProperty('--easy-fab-size', settings.sizePx + 'px');
    document.documentElement.style.setProperty('--easy-fab-font', fontPx + 'px');
    document.documentElement.style.setProperty('--easy-fab-bg', settings.bgColor);
    document.documentElement.style.setProperty('--easy-fab-fg', settings.fgColor);
  }

  function isVisible(el) {
    const r = el.getBoundingClientRect();
    const s = window.getComputedStyle(el);
    return s && s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  }

  function findNative(selector) {
    const el = document.querySelector(selector);
    return el && isVisible(el) ? el : null;
  }

  function clickNative(selector) {
    const el = findNative(selector);
    if (!el) return;
    try {
      el.click();
    } catch (e) {
      const evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, true, window, 1);
      el.dispatchEvent(evt);
    }
  }

  function createFab(def) {
    if (document.getElementById(def.id)) return;

    const btn = document.createElement('button');
    btn.id = def.id;
    btn.type = 'button';
    btn.className = 'easy-nzb-fab';
    btn.textContent = def.label;

    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      clickNative(def.selector);
    };

    document.documentElement.appendChild(btn);
  }

  function removeFab(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function positionButtons() {
    const enabled = [];
    for (let i = 0; i < settings.order.length; i++) {
      const key = settings.order[i];
      const def = BUTTONS[key];
      if (def && settings[def.key]) enabled.push(def);
    }

    for (let i = 0; i < enabled.length; i++) {
      const el = document.getElementById(enabled[i].id);
      if (!el) continue;
      el.style.bottom = (BASE_BOTTOM + i * (settings.sizePx + settings.spacingPx)) + 'px';
    }
  }

  function applyButtons() {
    applyCssVars();

    for (const k in BUTTONS) {
      const def = BUTTONS[k];
      if (settings[def.key]) createFab(def);
      else removeFab(def.id);
    }

    positionButtons();
  }

  function refreshState() {
    for (const k in BUTTONS) {
      const def = BUTTONS[k];
      if (!settings[def.key]) continue;

      const el = document.getElementById(def.id);
      if (!el) continue;

      if (findNative(def.selector)) el.removeAttribute('disabled');
      else el.setAttribute('disabled', 'true');
    }
  }

  function settingsChanged(a, b) {
    return JSON.stringify(a) !== JSON.stringify(b);
  }

  function pollSettings() {
    loadSettings(function (latest) {
      if (settingsChanged(settings, latest)) {
        settings = latest;
        applyButtons();
        refreshState();
      }
    });
  }

  function init() {
    loadSettings(function (s) {
      settings = s;
      applyButtons();
      refreshState();
      pollTimer = setInterval(pollSettings, 750);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
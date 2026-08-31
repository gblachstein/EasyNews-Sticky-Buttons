(() => {
  const DEFAULTS = {
    enableNZB: true,
    enableZIP: true,
    enableUncheck: true,
    sizePx: 56,
    spacingPx: 14,
    bgColor: '#0ea5e9',
    fgColor: '#ffffff',
    order: ['nzb', 'zip', 'uncheck'] // bottom -> top
  };

  // Toggles
  const elNZB = document.getElementById('enableNZB');
  const elZIP = document.getElementById('enableZIP');
  const elUncheck = document.getElementById('enableUncheck');

  // Size / spacing
  const elSize = document.getElementById('sizePx');
  const elSpacing = document.getElementById('spacingPx');

  // Colors
  const elBG = document.getElementById('bgColor');
  const elFG = document.getElementById('fgColor');

  // Order selects (bottom/middle/top)
  const elBottom = document.getElementById('orderBottom');
  const elMiddle = document.getElementById('orderMiddle');
  const elTop = document.getElementById('orderTop');

  // Buttons / status
  const elReset = document.getElementById('reset');
  const elStatus = document.getElementById('status');

  function clamp(n, min, max) {
    n = Number(n);
    if (isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function setStatus(msg) {
    if (!elStatus) return;
    elStatus.textContent = msg;
    window.clearTimeout(setStatus._t);
    setStatus._t = window.setTimeout(() => {
      elStatus.textContent = '';
    }, 1500);
  }

  function normalizeOrder(bottom, middle, top) {
    const allowed = ['nzb', 'zip', 'uncheck'];
    let order = [bottom, middle, top].filter((x) => allowed.indexOf(x) !== -1);

    // Ensure uniqueness
    order = order.filter((x, i) => order.indexOf(x) === i);

    // Fill missing
    for (let i = 0; i < allowed.length; i++) {
      if (order.indexOf(allowed[i]) === -1) order.push(allowed[i]);
    }

    return order.slice(0, 3);
  }

  function applyOrderToSelects(order) {
    elBottom.value = order[0];
    elMiddle.value = order[1];
    elTop.value = order[2];
  }

  function load() {
    chrome.storage.local.get(DEFAULTS, (items) => {
      const s = Object.assign({}, DEFAULTS, items || {});

      elNZB.checked = !!s.enableNZB;
      elZIP.checked = !!s.enableZIP;
      elUncheck.checked = !!s.enableUncheck;

      elSize.value = clamp(s.sizePx, 36, 96);
      elSpacing.value = clamp(s.spacingPx, 0, 80);

      // Color inputs expect #RRGGBB
      elBG.value = (s.bgColor && String(s.bgColor)) ? s.bgColor : DEFAULTS.bgColor;
      elFG.value = (s.fgColor && String(s.fgColor)) ? s.fgColor : DEFAULTS.fgColor;

      const order = Array.isArray(s.order) ? s.order : DEFAULTS.order;
      applyOrderToSelects(normalizeOrder(order[0], order[1], order[2]));
    });
  }

  function save() {
    const order = normalizeOrder(elBottom.value, elMiddle.value, elTop.value);
    applyOrderToSelects(order);

    chrome.storage.local.set(
      {
        enableNZB: elNZB.checked,
        enableZIP: elZIP.checked,
        enableUncheck: elUncheck.checked,
        sizePx: clamp(elSize.value, 36, 96),
        spacingPx: clamp(elSpacing.value, 0, 80),
        bgColor: elBG.value,
        fgColor: elFG.value,
        order: order
      },
      () => setStatus('Saved.')
    );
  }

  // Wire events
  elNZB.addEventListener('change', save);
  elZIP.addEventListener('change', save);
  elUncheck.addEventListener('change', save);

  elSize.addEventListener('change', save);
  elSpacing.addEventListener('change', save);

  elBG.addEventListener('change', save);
  elFG.addEventListener('change', save);

  elBottom.addEventListener('change', save);
  elMiddle.addEventListener('change', save);
  elTop.addEventListener('change', save);

  elReset.addEventListener('click', () => {
    chrome.storage.local.set(DEFAULTS, () => {
      load();
      setStatus('Reset.');
    });
  });

  load();
})();
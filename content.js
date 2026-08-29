(() => {
  // Exact selector for the NZB input button
  const NZB_BUTTON_SELECTORS = [
    'input[type="submit"][name="autoNZB"][value="NZB"]'
  ];

  const FAB_ID = 'easy-nzb-fab';
  let lastFoundButton = null;

  function createFab() {
    if (document.getElementById(FAB_ID)) return;

    const btn = document.createElement('button');
    btn.id = FAB_ID;
    btn.type = 'button';
    btn.textContent = 'NZB';
    btn.setAttribute('data-label', 'Click NZB');
    btn.addEventListener('click', onFabClick);

    document.documentElement.appendChild(btn);
  }

  function setFabEnabled(enabled) {
    const fab = document.getElementById(FAB_ID);
    if (!fab) return;
    if (enabled) {
      fab.removeAttribute('disabled');
      fab.title = 'NZB is available';
    } else {
      fab.setAttribute('disabled', 'true');
      fab.title = 'NZB button not found on this page';
    }
  }

  function findNzbButton() {
    for (const sel of NZB_BUTTON_SELECTORS) {
      const el = document.querySelector(sel);
      if (el && isVisible(el)) {
        return el;
      }
    }
    return null;
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      style &&
      style.visibility !== 'hidden' &&
      style.display !== 'none' &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function onFabClick(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const target = findNzbButton();
    if (target) {
      try {
        target.click(); // should trigger the same as clicking the submit button
      } catch (_) {
        // fallback: dispatch a synthetic click
        const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        target.dispatchEvent(evt);
      }
    } else {
      const fab = document.getElementById(FAB_ID);
      if (fab) {
        fab.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(0.95)' }, { transform: 'scale(1)' }],
          { duration: 150 }
        );
      }
    }
  }

  function refreshBinding() {
    lastFoundButton = findNzbButton();
    setFabEnabled(!!lastFoundButton);
  }

  const obs = new MutationObserver(refreshBinding);

  function init() {
    createFab();
    refreshBinding();

    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    document.addEventListener('visibilitychange', refreshBinding, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

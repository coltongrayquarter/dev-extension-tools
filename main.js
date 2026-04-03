(() => {
  const notesOverlayId = 'smart-notes-overlay';

  const toggleNotesOverlay = () => {
    createRoot();

    const existing = document.getElementById(notesOverlayId);
    if (existing) {
      existing.remove();
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = notesOverlayId;

    Object.assign(overlay.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(30,30,30,0.95)',
      borderRadius: '10px',
      padding: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      pointerEvents: 'auto',
      zIndex: '10005',
    });

    overlay.appendChild(createNotesFeature());
    smartState.root.appendChild(overlay);
  };

  const url = location.href;
  const history = JSON.parse(
    localStorage.getItem('smartInvertHistory') || '[]'
  );

  const isGlobal = localStorage.getItem('smartInvertEnabled') === 'true';
  const isPage = history.includes(url);

  if (isGlobal || isPage) {
    invertPageColors();
  }

  const legacyPanel = document.getElementById('smart-panel');
  if (legacyPanel) legacyPanel.remove();

  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      switch (message?.type) {
        case 'SMART_ACTION_TOGGLE_DARK_MODE':
          toggleInvert();
          sendResponse({ ok: true });
          break;
        case 'SMART_ACTION_TOGGLE_HOVER_INSPECT':
          toggleHoverInspect();
          sendResponse({ ok: true });
          break;
        case 'SMART_ACTION_AUTOFILL':
          toggleAutofill();
          sendResponse({ ok: true });
          break;
        case 'SMART_ACTION_COPY_TEXT_MODE':
          createRoot();
          enableScrapeMode();
          sendResponse({ ok: true });
          break;
        case 'SMART_ACTION_NOTES':
          toggleNotesOverlay();
          sendResponse({ ok: true });
          break;
        default:
          return;
      }

      return true;
    });
  }
})();

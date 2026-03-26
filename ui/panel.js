function createPanel() {
  createRoot();

  if (document.getElementById('smart-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'smart-panel';

  Object.assign(panel.style, {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    pointerEvents: 'auto',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    zIndex: '10000',
  });

  const container = document.createElement('div');
  Object.assign(container.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    background: 'rgba(30,30,30,0.85)',
    borderRadius: '10px',
    backdropFilter: 'blur(6px)',
    overflow: 'hidden',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  });

  const toggle = document.createElement('button');
  const menu = document.createElement('div');

  let open = false;

  function updateUI() {
    toggle.textContent = open ? '✕' : '☰';
    menu.style.display = open ? 'flex' : 'none';
  }

  Object.assign(toggle.style, {
    ...baseBtnStyle(),
    borderRadius: '0',
    width: '100%',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
  });

  Object.assign(menu.style, {
    display: 'none',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px',
  });

  toggle.onclick = () => {
    open = !open;
    updateUI();
  };

  // Feature buttons
  const darkBtn = makeButton('🌓 Dark Mode', toggleInvert);
  const inspectBtn = makeButton('🔍 Hover Inspect', toggleHoverInspect);
  const autofillBtn = makeButton('✍️ Autofill Form', toggleAutofill);
  const clickScrapeBtn = makeButton('📦 Copy Text', enableScrapeMode);

  menu.appendChild(clickScrapeBtn);
  menu.appendChild(darkBtn);
  menu.appendChild(inspectBtn);
  menu.appendChild(autofillBtn);

  container.appendChild(toggle);
  container.appendChild(menu);
  panel.appendChild(container);

  smartState.root.appendChild(panel);

  updateUI();
}

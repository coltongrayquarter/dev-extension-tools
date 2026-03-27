const destroyPanel = () => {
  const panel = document.getElementById('smart-panel');
  if (panel) panel.remove();

  if (smartState.root && smartState.root.childElementCount === 0) {
    smartState.root.remove();
    smartState.root = null;
  }
};

const createPanel = () => {
  createRoot();

  if (document.getElementById('smart-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'smart-panel';

  Object.assign(panel.style, {
    position: 'fixed',
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

  const header = document.createElement('div');
  header.id = 'smart-panel-header';

  const title = document.createElement('div');
  const minimizeBtn = document.createElement('button');

  let open = false;

  function updateUI() {
    title.textContent = open ? 'Dev Tools' : '☰ Dev Tools';
    menu.style.display = open ? 'flex' : 'none';
    minimizeBtn.style.display = open ? 'block' : 'none';
  }

  Object.assign(header.style, {
    display: 'flex',
    width: '100%',
    cursor: 'grab',
  });

  Object.assign(title.style, {
    flex: '1',
    padding: '8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    userSelect: 'none',
  });

  Object.assign(minimizeBtn.style, {
    ...baseBtnStyle(),
    width: '32px',
    borderRadius: '0',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'none',
  });

  minimizeBtn.textContent = '-';

  minimizeBtn.onclick = (e) => {
    e.stopPropagation();
    open = false;
    notesContainer.style.display = 'none';
    updateUI();
  };

  header.onclick = (e) => {
    if (e.target === minimizeBtn) return;
    if (!open) {
      open = true;
      smartState.notesOpen ? (notesContainer.style.display = 'block') : null;
      updateUI();
    }
  };

  header.appendChild(title);
  header.appendChild(minimizeBtn);

  const menu = document.createElement('div');
  Object.assign(menu.style, {
    display: 'none',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px',
  });

  const darkBtn = makeButton('🌓 Dark Mode', toggleInvert);
  const inspectBtn = makeButton('🔍 Hover Inspect', toggleHoverInspect);
  const autofillBtn = makeButton('✍️ Autofill Form', toggleAutofill);
  const clickScrapeBtn = makeButton('📦 Copy Text', enableScrapeMode);
  const notesToggleBtn = makeButton('📝 Notes', () => {
    smartState.notesOpen = !smartState.notesOpen;
    notesContainer.style.display = smartState.notesOpen ? 'block' : 'none';
  });

  const notesContainer = document.createElement('div');

  Object.assign(notesContainer.style, {
    position: 'absolute',
    right: '100%',
    bottom: '0',
    marginRight: '10px',
    display: smartState.notesOpen ? 'block' : 'none',
    background: 'rgba(30,30,30,0.95)',
    borderRadius: '10px',
    padding: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  });

  notesContainer.appendChild(createNotesFeature());

  menu.appendChild(clickScrapeBtn);
  menu.appendChild(darkBtn);
  menu.appendChild(inspectBtn);
  menu.appendChild(autofillBtn);
  menu.appendChild(notesToggleBtn);
  panel.appendChild(notesContainer);

  container.appendChild(header);
  container.appendChild(menu);
  panel.appendChild(container);

  smartState.root.appendChild(panel);

  makeDraggable(panel);

  updateUI();
};

const makeDraggable = (element) => {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const storageKey = 'smartPanelPosition';

  // Load saved position
  const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (saved) {
    element.style.left = saved.x + 'px';
    element.style.top = saved.y + 'px';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }

  element.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#smart-panel-header')) return;

    isDragging = true;

    const rect = element.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    element.style.left = x + 'px';
    element.style.top = y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    element.style.cursor = 'default';

    const rect = element.getBoundingClientRect();
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        x: rect.left,
        y: rect.top,
      })
    );
  });
};

function createHoverUI() {
  createRoot();
  if (smartState.hoverBox) return;

  // Tooltip
  smartState.hoverBox = document.createElement('div');
  Object.assign(smartState.hoverBox.style, {
    position: 'fixed',
    pointerEvents: 'none',
    background: 'rgba(0,0,0,0.85)',
    color: '#0f0',
    padding: '6px 8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    borderRadius: '4px',
    maxWidth: '400px',
    whiteSpace: 'pre-wrap',
    zIndex: '10001',
    display: 'block',
  });

  // Highlight overlay
  smartState.highlightOverlay = document.createElement('div');
  Object.assign(smartState.highlightOverlay.style, {
    position: 'fixed',
    border: '2px solid #00ff00',
    background: 'rgba(0,255,0,0.1)',
    pointerEvents: 'none',
    zIndex: '10000',
    display: 'block',
  });

  smartState.root.appendChild(smartState.highlightOverlay);
  smartState.root.appendChild(smartState.hoverBox);
}

// Return a short DOM path (up to 5 levels)
function getDomPath(el) {
  let path = [];
  while (el && el.nodeType === 1 && path.length < 5) {
    let name = el.tagName.toLowerCase();
    if (el.id) name += `#${el.id}`;
    if (el.className)
      name += '.' + el.className.toString().trim().replace(/\s+/g, '.');
    path.unshift(name);
    el = el.parentElement;
  }
  return path.join(' > ');
}

// Position tooltip near cursor
function positionTooltip(x, y) {
  const pad = 10;
  const box = smartState.hoverBox;

  let left = x + pad;
  let top = y + pad;

  if (left + box.offsetWidth > window.innerWidth) {
    left = x - box.offsetWidth - pad;
  }
  if (top + box.offsetHeight > window.innerHeight) {
    top = y - box.offsetHeight - pad;
  }

  box.style.left = left + 'px';
  box.style.top = top + 'px';
}

// Throttle movement
let lastMove = 0;

function handleHover(e) {
  if (!smartState.hoverInspectEnabled) return;

  const now = performance.now();
  if (now - lastMove < 30) return; // throttle
  lastMove = now;

  const el = e.target;
  const rect = el.getBoundingClientRect();

  // Highlight overlay
  Object.assign(smartState.highlightOverlay.style, {
    top: rect.top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
  });

  // Tooltip content
  smartState.hoverBox.textContent = `
${el.tagName.toLowerCase()}
id="${el.id || ''}"
class="${el.className || ''}"

${Math.round(rect.width)} x ${Math.round(rect.height)}

${getDomPath(el)}
`.trim();

  positionTooltip(e.clientX, e.clientY);
}

function toggleHoverInspect() {
  smartState.hoverInspectEnabled = !smartState.hoverInspectEnabled;

  if (smartState.hoverInspectEnabled) {
    createHoverUI();
    document.addEventListener('mousemove', handleHover);
  } else {
    document.removeEventListener('mousemove', handleHover);
    if (smartState.hoverBox) smartState.hoverBox.style.display = 'none';
    if (smartState.highlightOverlay)
      smartState.highlightOverlay.style.display = 'none';
  }

  if (smartState.hoverBox)
    smartState.hoverBox.style.display = smartState.hoverInspectEnabled
      ? 'block'
      : 'none';
  if (smartState.highlightOverlay)
    smartState.highlightOverlay.style.display = smartState.hoverInspectEnabled
      ? 'block'
      : 'none';
}

function createRoot() {
  if (smartState.root) return;

  smartState.root = document.createElement('div');
  smartState.root.id = 'smart-root';

  Object.assign(smartState.root.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '9999',
  });

  document.body.appendChild(smartState.root);
}

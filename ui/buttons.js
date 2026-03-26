const baseBtnStyle = () => {
  return {
    padding: '8px 10px',
    borderRadius: '6px',
    border: 'none',
    background: '#333',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 0 8px rgba(0,0,0,0.4)',
    textAlign: 'left',
  };
};

const makeButton = (label, onClick) => {
  const btn = document.createElement('button');
  btn.textContent = label;
  Object.assign(btn.style, baseBtnStyle());

  // Hover effect
  btn.onmouseenter = () => (btn.style.background = '#444');
  btn.onmouseleave = () => (btn.style.background = '#333');

  btn.onclick = onClick;
  return btn;
};

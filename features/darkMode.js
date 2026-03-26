const invertPageColors = () => {
  const styleId = 'smart-invert-style';
  if (document.getElementById(styleId)) return;

  document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    img, video, picture, canvas, svg {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `;
  document.head.appendChild(style);
};

const removeInvert = () => {
  const style = document.getElementById('smart-invert-style');
  if (style) style.remove();
  document.documentElement.style.filter = '';
};

const toggleInvert = () => {
  const styleExists = document.getElementById('smart-invert-style');
  const url = location.href;

  let history = JSON.parse(localStorage.getItem('smartInvertHistory') || '[]');

  if (styleExists) {
    removeInvert();
    localStorage.setItem('smartInvertEnabled', 'false');

    history = history.filter((h) => h !== url);
    localStorage.setItem('smartInvertHistory', JSON.stringify(history));
  } else {
    invertPageColors();
    localStorage.setItem('smartInvertEnabled', 'true');

    if (!history.includes(url)) {
      history.push(url);
      localStorage.setItem('smartInvertHistory', JSON.stringify(history));
    }
  }
};

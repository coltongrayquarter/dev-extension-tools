(function init() {
  const url = location.href;
  const history = JSON.parse(
    localStorage.getItem('smartInvertHistory') || '[]'
  );

  const isGlobal = localStorage.getItem('smartInvertEnabled') === 'true';
  const isPage = history.includes(url);

  if (isGlobal || isPage) {
    invertPageColors();
  }

  createPanel();
})();

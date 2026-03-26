// ===========================
// CLICK-TO-SCRAPE (TEXT ONLY)
// ===========================
smartState.scrapeMode = false;
smartState.scrapeOverlay = null;

// Enable scrape mode
function enableScrapeMode() {
  if (smartState.scrapeMode) return;
  smartState.scrapeMode = true;

  // Create highlight overlay
  smartState.scrapeOverlay = document.createElement('div');
  Object.assign(smartState.scrapeOverlay.style, {
    position: 'fixed',
    border: '2px dashed #00ffff',
    background: 'rgba(0,255,255,0.1)',
    pointerEvents: 'none',
    zIndex: 10002,
  });
  smartState.root.appendChild(smartState.scrapeOverlay);

  // Mouse move to highlight
  document.addEventListener('mousemove', scrapeMouseMove);
  // Click to scrape
  document.addEventListener('click', scrapeClick, true);
}

// Disable scrape mode
function disableScrapeMode() {
  smartState.scrapeMode = false;
  if (smartState.scrapeOverlay) {
    smartState.scrapeOverlay.remove();
    smartState.scrapeOverlay = null;
  }
  document.removeEventListener('mousemove', scrapeMouseMove);
  document.removeEventListener('click', scrapeClick, true);
}

// Highlight element under mouse
function scrapeMouseMove(e) {
  if (!smartState.scrapeMode) return;
  const el = e.target;
  const rect = el.getBoundingClientRect();
  Object.assign(smartState.scrapeOverlay.style, {
    top: rect.top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
  });
}

// On click, scrape only the text
function scrapeClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const el = e.target;

  const text = el.innerText.trim();
  if (!text) {
    alert('⚠️ No visible text found in this element.');
    return;
  }

  // Copy text to clipboard
  navigator.clipboard.writeText(text);
  console.log('📋 Scraped text:', text);

  // Flash outline for feedback
  flashElement(el, '#00ffff');

  // Show success popup
  showScrapeSuccess();

  // Exit scrape mode
  disableScrapeMode();
}

// Flash outline for visual feedback
function flashElement(el, color = '#00ffff') {
  const rect = el.getBoundingClientRect();
  const flash = document.createElement('div');
  Object.assign(flash.style, {
    position: 'fixed',
    top: rect.top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    border: `2px solid ${color}`,
    background: 'rgba(0,255,255,0.2)',
    pointerEvents: 'none',
    zIndex: '10003',
    transition: 'opacity 0.4s ease',
  });
  smartState.root.appendChild(flash);
  setTimeout(() => (flash.style.opacity = '0'), 100);
  setTimeout(() => flash.remove(), 500);
}

// Success popup
function showScrapeSuccess() {
  const popup = document.createElement('div');
  popup.textContent = '✅ Text Scraped & Copied!';
  Object.assign(popup.style, {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    background: 'rgba(0,255,0,0.85)',
    color: '#000',
    padding: '8px 12px',
    borderRadius: '6px',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    zIndex: 10005,
    opacity: 1,
    transition: 'opacity 0.6s ease',
  });
  smartState.root.appendChild(popup);
  setTimeout(() => (popup.style.opacity = '0'), 800);
  setTimeout(() => popup.remove(), 1400);
}

function createNotesFeature() {
  const wrapper = document.createElement('div');

  const textarea = document.createElement('textarea');
  const actions = document.createElement('div');
  const downloadBtn = document.createElement('button');
  const clearBtn = document.createElement('button');

  const storageKey = 'smartNotes_' + location.href;

  // Load saved notes
  textarea.value = localStorage.getItem(storageKey) || '';

  Object.assign(textarea.style, {
    width: '220px',
    height: '120px',
    resize: 'vertical',
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    outline: 'none',
    fontSize: '12px',
    fontFamily: 'monospace',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
  });

  Object.assign(actions.style, {
    display: 'flex',
    gap: '6px',
    marginTop: '6px',
  });

  downloadBtn.textContent = '⬇️ Save';
  clearBtn.textContent = '🗑 Clear';

  [downloadBtn, clearBtn].forEach((btn) => {
    Object.assign(btn.style, {
      ...baseBtnStyle(),
      fontSize: '11px',
      padding: '4px 6px',
    });
  });

  // Auto-save on input
  textarea.addEventListener('input', () => {
    localStorage.setItem(storageKey, textarea.value);
  });

  // Download notes
  downloadBtn.onclick = () => {
    const content = `
URL: ${location.href}
Saved: ${new Date().toLocaleString()}

------------------------

${textarea.value}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = 'notes.txt';
    a.click();

    URL.revokeObjectURL(a.href);
  };

  // Clear notes
  clearBtn.onclick = () => {
    textarea.value = '';
    localStorage.removeItem(storageKey);
  };

  actions.appendChild(downloadBtn);
  actions.appendChild(clearBtn);

  wrapper.appendChild(textarea);
  wrapper.appendChild(actions);

  return wrapper;
}

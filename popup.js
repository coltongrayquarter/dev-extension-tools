const statusEl = document.getElementById('status');

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ff9f9f' : '#8dd1ff';
};

const getActiveTab = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

const sendAction = async (actionType) => {
  const tab = await getActiveTab();

  if (!tab?.id) {
    setStatus('No active tab found.', true);
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: actionType });
    setStatus('Action sent.');
  } catch (_error) {
    setStatus('Reload the page and try again.', true);
  }
};

document.querySelectorAll('button[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const actionType = button.getAttribute('data-action');
    sendAction(actionType);
  });
});

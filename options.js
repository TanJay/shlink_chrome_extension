// Load saved config from storage when the options page loads
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['baseUrl', 'apiKey'], (data) => {
    document.getElementById('base-url').value = data.baseUrl || '';
    document.getElementById('api-key').value = data.apiKey || '';
  });
});

// Save the Base URL and API Key to storage
document.getElementById('save').addEventListener('click', () => {
  const baseUrl = document.getElementById('base-url').value;
  const apiKey = document.getElementById('api-key').value;

  chrome.storage.sync.set({ baseUrl, apiKey }, () => {
    document.getElementById('status').textContent = 'Settings saved.';
    setTimeout(() => {
      document.getElementById('status').textContent = '';
    }, 2000);
  });
});

// Reset the Base URL and API Key in storage
document.getElementById('reset').addEventListener('click', () => {
  chrome.storage.sync.remove(['baseUrl', 'apiKey'], () => {
    document.getElementById('base-url').value = '';
    document.getElementById('api-key').value = '';
    document.getElementById('status').textContent = 'Settings reset.';
    setTimeout(() => {
      document.getElementById('status').textContent = '';
    }, 2000);
  });
});

document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  const contentDiv = document.getElementById('content');
  
  chrome.storage.sync.get(['baseUrl', 'apiKey'], function(data) {
    console.log('Base URL:', data.baseUrl, 'API Key:', data.apiKey);

    if (!data.baseUrl || !data.apiKey) {
      // Configuration is missing
      contentDiv.innerHTML = `
        <p>Please configure the Base URL and API Key before using this extension.</p>
        <button id="open-options">Open Settings</button>
      `;

      // Handle button click to open options page
      document.getElementById('open-options').addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
      });
    } else {
      // Configuration is set, show the form to create short links
      contentDiv.innerHTML = `
        <form id="short-link-form">
          <label for="long-url">Long URL</label>
          <input type="text" id="long-url" placeholder="Fetching current tab URL..." disabled>
          
          <label for="domain">Domain</label>
          <select id="domain">
            <option value="" disabled selected>Select domain</option>
          </select>

          <label for="custom-slug">Custom Slug (Optional)</label>
          <input type="text" id="custom-slug" placeholder="Custom Slug">
          
          <button type="submit">Create Short URL</button>
        </form>
        <div id="result"></div>
      `;

      // Populate current tab's URL in the long-url input
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        let currentTab = tabs[0];
        document.getElementById('long-url').value = currentTab.url;
      });

      // Fetch available domains and populate the domain dropdown
      fetchAvailableDomains(data.baseUrl, data.apiKey);
      console.log(data);

      // Handle form submission to create the short URL
      document.getElementById('short-link-form').addEventListener('submit', function(event) {
        event.preventDefault();
        createShortURL(data.baseUrl, data.apiKey);
      });
    }
  });
});

function fetchAvailableDomains(baseUrl, apiKey) {
  fetch(`${baseUrl}/rest/v3/domains`, {
    headers: { 'X-Api-Key': apiKey }
  })
  .then(response => response.json())
  .then(domains => {
    const domainSelect = document.getElementById('domain');
    
    // Clear any existing options (in case the dropdown is populated already)
    domainSelect.innerHTML = '';

    // Get the default domain
    let defaultDomain = domains.domains.data.find(domain => domain.isDefault)?.domain;

    // Populate the dropdown with domains and select the default domain
    domains.domains.data.forEach(domain => {
      const option = document.createElement('option');
      option.value = domain.domain;
      option.text = domain.domain;

      // Select the default domain if it matches
      if (domain.domain === defaultDomain) {
        option.selected = true;
      }

      domainSelect.appendChild(option);
    });

    // If there is a default domain, make sure it's selected in the dropdown
    if (defaultDomain) {
      domainSelect.value = defaultDomain;
    }
  })
  .catch(error => {
    console.error("Error fetching domains:", error);
  });
}


function createShortURL(baseUrl, apiKey) {
  const longUrl = document.getElementById('long-url').value;
  const domain = document.getElementById('domain').value;
  const customSlug = document.getElementById('custom-slug').value;
  
  const payload = {
    longUrl,
    domain,
    crawlable: false,
    forwardQuery: true,
    findIfExists: true
  };

  if (customSlug && customSlug.trim() !== "") {
    payload.customSlug = customSlug.trim();
  }
  
  fetch(`${baseUrl}/rest/v3/short-urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(shortUrlData => {
    console.log("API Response:", shortUrlData); // Log the entire API response for debugging
    
    if (shortUrlData.shortUrl) {
      const shortUrl = shortUrlData.shortUrl;
      navigator.clipboard.writeText(shortUrl).then(() => {
        document.getElementById('result').innerText = `Short URL copied: ${shortUrl}`;
      });
    } else {
      document.getElementById('result').innerText = `Error: Short URL not created.`;
    }
  })
  .catch(error => {
    document.getElementById('result').innerText = `Error: ${error}`;
    console.error("Error during short URL creation:", error);
  });
}





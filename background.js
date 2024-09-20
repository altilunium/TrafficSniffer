chrome.webRequest.onCompleted.addListener(
  (details) => {
    const requestUrl = details.url;
    const timestamp = new Date().toISOString();
    const tabId = details.tabId;

    if (tabId !== -1) {
      // Get information about the tab that made the request
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          const tabUrl = tab.url;
          const tabTitle = tab.title;

          // Log the request, tab info, and timestamp
          chrome.storage.local.get({ browsingHistory: [] }, (result) => {
            const browsingHistory = result.browsingHistory;
            browsingHistory.push({
              requestUrl: requestUrl,
              timestamp: timestamp,
              tabUrl: tabUrl,
              tabTitle: tabTitle
            });

            chrome.storage.local.set({ browsingHistory: browsingHistory }, () => {
              console.log(`Logged HTTP Request: ${requestUrl} at ${timestamp} from Tab: ${tabTitle} (${tabUrl})`);
            });
          });
        }
      });
    }
  },
  { urls: ["<all_urls>"] }
);


chrome.action.onClicked.addListener((tab) => {
  // Open the log webpage when the extension icon is clicked
  chrome.tabs.create({ url: 'log.html' });
});
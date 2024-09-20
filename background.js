// Open IndexedDB
function openDatabase(callback) {
    const request = indexedDB.open("BrowsingHistoryDB", 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create an object store for browsing history if it doesn't exist
        if (!db.objectStoreNames.contains("browsingHistory")) {
            const objectStore = db.createObjectStore("browsingHistory", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("requestUrl", "requestUrl", { unique: false });
            objectStore.createIndex("timestamp", "timestamp", { unique: false });
            objectStore.createIndex("tabUrl", "tabUrl", { unique: false });
            objectStore.createIndex("tabTitle", "tabTitle", { unique: false });
        }
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        callback(db);
    };

    request.onerror = (event) => {
        console.error("IndexedDB error: ", event.target.error);
    };
}

// Log browsing history to IndexedDB
function logBrowsingHistory(requestUrl, timestamp, tabUrl, tabTitle) {
    openDatabase((db) => {
        const transaction = db.transaction(["browsingHistory"], "readwrite");
        const objectStore = transaction.objectStore("browsingHistory");

        // Add the browsing history entry
        objectStore.add({
            requestUrl: requestUrl,
            timestamp: timestamp,
            tabUrl: tabUrl,
            tabTitle: tabTitle
        });

        transaction.oncomplete = () => {
            console.log(`Logged HTTP Request: ${requestUrl} at ${timestamp} from Tab: ${tabTitle} (${tabUrl})`);
        };

        transaction.onerror = (event) => {
            console.error("Error adding entry: ", event.target.error);
        };
    });
}

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

                    // Log the request, tab info, and timestamp to IndexedDB
                    logBrowsingHistory(requestUrl, timestamp, tabUrl, tabTitle);
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

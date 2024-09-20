document.addEventListener('DOMContentLoaded', () => {
    const logElement = document.getElementById('log');
    const storageStatus = document.getElementById('storageStatus');
    const clearStorageButton = document.getElementById('clearStorageButton');

    // Open IndexedDB
    function openDatabase(callback) {
        const request = indexedDB.open("BrowsingHistoryDB", 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            callback(db);
        };

        request.onerror = (event) => {
            console.error("IndexedDB error: ", event.target.error);
        };
    }

    // Function to fetch browsing history from IndexedDB
    function fetchBrowsingHistory() {
        openDatabase((db) => {
            const transaction = db.transaction(["browsingHistory"], "readonly");
            const objectStore = transaction.objectStore("browsingHistory");
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = () => {
                const browsingHistory = getAllRequest.result;

                // Display each log entry
                browsingHistory.forEach((entry) => {
                    const li = document.createElement('p');
                    li.innerHTML = `${formatTimestamp(entry.timestamp)}<br><b>${entry.tabTitle}</b><br>${entry.tabUrl}<br>${entry.requestUrl}<br><br>`;

                    if (logElement.firstChild) {
                        logElement.insertBefore(li, logElement.firstChild);
                    } else {
                        logElement.appendChild(li);
                    }
                });
            };

            getAllRequest.onerror = (event) => {
                console.error("Error fetching browsing history: ", event.target.error);
            };
        });
    }

    // Function to clear browsing history from IndexedDB
    function clearIndexedDBHistory() {
        openDatabase((db) => {
            const transaction = db.transaction(["browsingHistory"], "readwrite");
            const objectStore = transaction.objectStore("browsingHistory");
            const clearRequest = objectStore.clear();

            clearRequest.onsuccess = () => {
                console.log("Browsing history cleared from IndexedDB.");
                checkStorageCapacity(); // Update the status after clearing
                logElement.innerHTML = ''; // Clear the displayed logs
            };

            clearRequest.onerror = (event) => {
                console.error("Error clearing browsing history: ", event.target.error);
            };
        });
    }

    // Function to check the IndexedDB storage capacity (this is a simulation)
    function checkStorageCapacity() {
        openDatabase((db) => {
            const transaction = db.transaction(["browsingHistory"], "readonly");
            const objectStore = transaction.objectStore("browsingHistory");
            const countRequest = objectStore.count();

            countRequest.onsuccess = () => {
                const usedEntries = countRequest.result;
                const capacity = 1000000; // Simulated capacity (1 million entries)
                const isFull = usedEntries >= capacity;
                const perc = (usedEntries / capacity) * 100;
                storageStatus.textContent = isFull
                    ? 'IndexedDB storage is full.'
                    : `IndexedDB storage used: ${perc.toFixed(2)}%.`;
            };

            countRequest.onerror = (event) => {
                console.error("Error checking storage capacity: ", event.target.error);
            };
        });
    }

    // Event listener for clearing the history
    clearStorageButton.addEventListener('click', clearIndexedDBHistory);

    // Call this to initially check storage capacity
    checkStorageCapacity();

    // Call this to fetch browsing history and display it
    fetchBrowsingHistory();

    // Function to format timestamp
    function formatTimestamp(isoTimestamp) {
        const date = new Date(isoTimestamp);

        const options = {
            timeZone: 'Asia/Bangkok', // GMT+7
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };

        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        return formattedDate.replace(',', ''); // Remove comma
    }
});

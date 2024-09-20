document.addEventListener('DOMContentLoaded', () => {
  const logElement = document.getElementById('log');
     const storageStatus = document.getElementById('storageStatus');
    const clearStorageButton = document.getElementById('clearStorageButton');


     function checkLocalStorageCapacity() {
         chrome.storage.local.getBytesInUse(null, function (usedBytes) {
            const capacity = 5 * 1024 * 1024; // 5MB is the limit for chrome.storage.local
            const isFull = usedBytes >= capacity;
            var perc = usedBytes / capacity * 100
            storageStatus.textContent = isFull ? 'Chrome storage is full.' : `Chrome storage used: ${perc}%.`;
        });
    }

     function clearLocalStorage() {
        chrome.storage.local.clear(function () {
            checkChromeStorageCapacity(); // Update status after clearing
        });
    }

    clearStorageButton.addEventListener('click', clearLocalStorage);

    checkLocalStorageCapacity();

  // Function to convert ISO timestamp to GMT+7 and remove T/Z
  function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);

    // Convert to GMT+7
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

  // Fetch the browsing history from local storage
  chrome.storage.local.get({ browsingHistory: [] }, (result) => {
    const browsingHistory = result.browsingHistory;

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

    
  });


});

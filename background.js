function closeAsideAndScrollToAnchor() {
  // Set this flag to true for debugging, false for production
  const DEBUG = false;
  function log(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  log('closeAsideAndScrollToAnchor function called');

  // Find the open aside element
  const asides = document.querySelectorAll('aside[class=""]');
  const openAside = Array.from(asides).find(aside => aside.getAttribute('aria-hidden') === 'false');

  if (openAside) {
    log('Open aside found');

    // Find and click the close button
    const closeButton = openAside.querySelector('button[class^="awsui_tools-close"]');
    if (closeButton) {
      log('Close button found');
      closeButton.click();
      log('Close button clicked');
    } else {
      log('Close button not found');
    }
  } else {
    log('No open aside found');
  }

  // Check if the URL contains an anchor
  if (window.location.hash) {
    log('Anchor found in URL:', window.location.hash);

    // Extract the anchor ID from the URL
    const anchorId = window.location.hash.substring(1);

    // Find the anchor element
    const anchorElement = document.getElementById(anchorId);

    if (anchorElement) {
      log('Anchor element found:', anchorElement);

      // Close the aside and scroll to the anchor element after a delay
      setTimeout(() => {
        anchorElement.scrollIntoView({behavior: 'auto'});
        // Return true to indicate successful scroll
        return true;
      }, 500);
    } else {
      log('Anchor element not found for ID:', anchorId);
    }
  } else {
    log('No anchor found in URL');
  }

  // Return false if scroll was not successful
  return false;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('https://docs.aws.amazon.com/') && tab.active) {
    console.log('Tab updated and matches conditions');

    let attempts = 0;
    const maxAttempts = 5;

    const tryCloseAsideAndScrollToAnchor = () => {
      console.log('Attempting to close aside and scroll to anchor, attempt:', attempts + 1);

      // Execute the closeAsideAndScrollToAnchor function in the tab's context
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: closeAsideAndScrollToAnchor
      }, (results) => {
        attempts++;

        // Check if scroll was successful
        if (results && results[0]) {
          console.log('Scroll successful, stopping further attempts');
        } else if (attempts < maxAttempts) {
          // Retry after a delay if maximum attempts not reached
          setTimeout(() => {
            tryCloseAsideAndScrollToAnchor();
          }, 1000);
        } else {
          console.log('Max attempts reached');
        }
      });
    };

    // Start the first attempt immediately
    tryCloseAsideAndScrollToAnchor();
  }
});

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function closeAsideScript() {
  const asides = document.querySelectorAll('aside[class=""]');
  const openAside = Array.from(asides).find(aside => aside.getAttribute('aria-hidden') === 'false');
  if (openAside) {
    const closeButton = openAside.querySelector('button[class^="awsui_tools-close"]');
    if (closeButton) {
      closeButton.click();
    }
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('https://docs.aws.amazon.com/') && tab.active) {
    let attempts = 0;
    const maxAttempts = 5;

    const tryCloseAside = () => {
      if (attempts < maxAttempts) {
        delay(1000).then(() => {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: closeAsideScript
          });
          attempts++;
          tryCloseAside();
        });
      }
    };

    tryCloseAside();
  }
});

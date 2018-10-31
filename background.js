// activate the pageAction
chrome.tabs.onUpdated.addListener((tabId, changeIngo, tab) => {
  if(tab.url.includes("youtube.com/watch")) chrome.pageAction.show(tabId)
})

// pass the messages from the popup to the tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  chrome.tabs.query({url: "*://*.youtube.com/watch?v=*"}, (tabs) => {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, message);
    }
  })
})

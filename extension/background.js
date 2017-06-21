"use strict";
(function () {
    // Example: Parse a list of match patterns:
    var patterns = chrome.runtime.getManifest().content_scripts[0].matches;

    // Parse list and filter(exclude) invalid match patterns
    var parsed = patterns.map(util.parseMatchPattern)
        .filter(function (pattern) {
            return pattern !== null
        });
    // Create pattern for validation:
    var pattern = new RegExp(parsed.join('|'));

    var printScreen = function (tabId) {
        chrome.tabs.captureVisibleTab(
            null, {
                quality: 8
            },
            function (dataUrl) {
                util.log('Sending print to content script.');
                chrome.tabs.sendMessage(tabId, {
                    dataUrl: dataUrl
                });
            }
        );
    }


    var onUpdatedListener = function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' || changeInfo.status === 'loading') {
            var url = tab.url.split('#')[0];
            if (pattern.test(url)) {
                if (tab.active == true) {
                    printScreen(tabId);
                } else {
                    var onActivatedListener = function (activeInfo) {
                        if (tabId == activeInfo.tabId) {
                            printScreen(activeInfo.tabId);
                            chrome.tabs.onActivated.removeListener(onActivatedListener);
                        }
                    }
                    chrome.tabs.onActivated.addListener(onActivatedListener);
                }
            }
        }
    };

    chrome.tabs.onUpdated.addListener(onUpdatedListener);
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.message == "print") {
            printScreen(sender.tab.id);
        }
        sendResponse();
    });
}());
function parse_match_pattern(input) {
    if (typeof input !== 'string') return null;
    var match_pattern = '(?:^',
        regEscape = function (s) {
            return s.replace(/[[^$.|?*+(){}\\]/g, '\\$&');
        },
        result = /^(\*|https?|file|ftp|chrome-extension):\/\//.exec(input);

    // Parse scheme
    if (!result) return null;
    input = input.substr(result[0].length);
    match_pattern += result[1] === '*' ? 'https?://' : result[1] + '://';

    // Parse host if scheme is not `file`
    if (result[1] !== 'file') {
        if (!(result = /^(?:\*|(\*\.)?([^\/*]+))(?=\/)/.exec(input))) return null;
        input = input.substr(result[0].length);
        if (result[0] === '*') { // host is '*'
            match_pattern += '[^/]+';
        } else {
            if (result[1]) { // Subdomain wildcard exists
                match_pattern += '(?:[^/]+\\.)?';
            }
            // Append host (escape special regex characters)
            match_pattern += regEscape(result[2]);
        }
    }
    // Add remainder (path)
    match_pattern += input.split('*').map(regEscape).join('.*');
    match_pattern += '$)';
    return match_pattern;
}

// Example: Parse a list of match patterns:
var patterns = [
    "*://*.promobit.com.br/*",
    "*://*.reddit.com/*",
    "*://*.uol.com.br/*",
    "*://*.g1.globo.com/*"
];

// Parse list and filter(exclude) invalid match patterns
var parsed = patterns.map(parse_match_pattern)
    .filter(function (pattern) {
        return pattern !== null
    });
// Create pattern for validation:
var pattern = new RegExp(parsed.join('|'));

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        var url = tab.url.split('#')[0]; // Exclude URL fragments
        if (pattern.test(url)) {
            chrome.tabs.getCurrent(function (a) {
                console.log(a)
            })
            chrome.tabs.captureVisibleTab(
                null, {},
                function (dataUrl, a, b, c) {
                    chrome.tabs.sendMessage(tabId, {
                        dataUrl: dataUrl
                    });
                }
            );
        }
    }
});
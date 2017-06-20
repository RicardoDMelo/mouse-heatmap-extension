"use strict";

var util = (function () {
    var packageName = 'Tracking';

    var log = function (message) {
        console.log('[' + packageName + '] ' + message);
    }
    var error = function (message) {
        console.error('[' + packageName + '] ' + message);
    }

    var generateUUID = function () { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    var parseMatchPattern = function (input) {
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

    var replaceAll = function (text, search, replacement) {
        return text.split(search).join(replacement);
    };

    var createCookie = function (name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    var readCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    var eraseCookie = function (name) {
        createCookie(name, "", -1);
    }

    var b64toBlob = function (b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    }

    return {
        generateUUID: generateUUID,
        log: log,
        error: error,
        createCookie: createCookie,
        readCookie: readCookie,
        eraseCookie: eraseCookie,
        replaceAll: replaceAll,
        parseMatchPattern: parseMatchPattern,
        b64toBlob: b64toBlob
    }
}());
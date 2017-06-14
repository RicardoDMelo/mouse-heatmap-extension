"use strict";

var util = (function () {
    var packageName = 'App';

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

    return {
        generateUUID: generateUUID,
        log: log,
        error: error,
        createCookie: createCookie,
        readCookie: readCookie,
        eraseCookie: eraseCookie,
        replaceAll: replaceAll
    }
}());

module.exports = (function util() {
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

    var valuesToArray = function (obj) {
        if (!obj) return [];
        return Object.keys(obj).map(function (key) {
            return obj[key];
        });
    }

    return {
        generateUUID: generateUUID,
        log: log,
        error: error,
        replaceAll: replaceAll,
        valuesToArray: valuesToArray
    }
})();
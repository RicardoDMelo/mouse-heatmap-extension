"use strict";
var util = (function () {

    var hello = function () {
        return 'bbb!';
    };

    var goodbye = function () {
        return 'goodbye!';
    };

    // Explicitly reveal public pointers to the private functions 
    // that we want to reveal publicly

    return {
        hello: hello,
        goodbye: goodbye
    }
})();
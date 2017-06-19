/*global $, window, firebase*/
"use strict";

var component = (function () {


    var bindSelect = function (sel, list) {
        clearSelect(sel);
        var fragment = document.createDocumentFragment();

        var opt = document.createElement('option');
        opt.innerHTML = '-';
        opt.value = null;
        fragment.appendChild(opt);

        list.forEach(function (item, index) {
            var opt = document.createElement('option');
            opt.innerHTML = item;
            opt.value = item;
            fragment.appendChild(opt);
        });
        sel.appendChild(fragment);
    }

    var clearSelect = function (sel) {
        sel.options.length = 0;
        sel.selectedIndex = 0;
    }

    return {
        bindSelect: bindSelect,
        clearSelect: clearSelect
    }
}());
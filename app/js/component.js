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
        sel.size = list.length + 1;
        sel.appendChild(fragment);
    }

    var bindSelectWithAlias = function (sel, list, alias) {
        clearSelect(sel);
        var fragment = document.createDocumentFragment();

        var opt = document.createElement('option');
        opt.innerHTML = '-';
        opt.value = null;
        fragment.appendChild(opt);

        for(var i = 0; i < list.length; i++){
            var opt = document.createElement('option');
            opt.innerHTML = alias[i];
            opt.value = list[i];
            fragment.appendChild(opt);
        }
        
        sel.size = list.length + 1;
        sel.appendChild(fragment);
    }

    var clearSelect = function (sel) {
        sel.options.length = 0;
        sel.selectedIndex = 0;
    }

    var clearContainer = function (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    return {
        bindSelect: bindSelect,
        bindSelectWithAlias: bindSelectWithAlias,
        clearSelect: clearSelect,
        clearContainer: clearContainer
    }
}());
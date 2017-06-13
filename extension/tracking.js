"use strict";

(function trackingMouse() {
    console.log("Extensão carregada!");
    var trackingData = [];
    document.querySelector('body').onmousemove = function trackingMousePush(ev) {
        trackingData.push({
            x: ev.layerX,
            y: ev.layerY,
            value: 1
        });
        console.log(trackingData.length);
    };
}());
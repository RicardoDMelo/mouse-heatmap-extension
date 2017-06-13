"use strict";

(function () {
    chrome.webNavigation.onCompleted.addListener(function (details) {
        console.log('Iniciando Tracking...');
        chrome.tabs.executeScript(details.tabId, {
            file: 'tracking.js'
        });
        console.log('Tracking chamado!');
    }, {
        url: [{
            // Runs on example.com, example.net, but also example.foo.com
            hostContains: '.promobit.'
        }]
    });

    var config = {
        apiKey: "AIzaSyCDndBcDzb3D7QRu70mqG1Ij_R8nMiDRy8",
        authDomain: "mouse-heatmap.firebaseapp.com",
        databaseURL: "https://mouse-heatmap.firebaseio.com",
        projectId: "mouse-heatmap",
        messagingSenderId: "602527389876"
    };
    firebase.initializeApp(config);

}());
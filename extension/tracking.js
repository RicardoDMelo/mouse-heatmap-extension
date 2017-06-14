"use strict";

(function trackingMouse() {
    console.log("Extension loaded!");
    var timerTracking = null;
    var timerSync = null;
    var trackingData = [];
    var authChangedCalled = false;
    var currentMousePosition = null;
    var lastMousePosition = null;
    var currentScrollPosition = document.body.scrollTop;
    var lastScrollPosition = null;

    var config = {
        apiKey: "AIzaSyCDndBcDzb3D7QRu70mqG1Ij_R8nMiDRy8",
        authDomain: "mouse-heatmap.firebaseapp.com",
        databaseURL: "https://mouse-heatmap.firebaseio.com",
        projectId: "mouse-heatmap",
        messagingSenderId: "602527389876"
    };
    
    firebase.initializeApp(config);
    firebase.auth().signInAnonymously().catch(function (error) {
        console.error(error.message);
    });

    firebase.auth().onAuthStateChanged(function (user) {
        if (authChangedCalled == false) {
            authChangedCalled = true;
            return;
        }
        if (user) {
            startTracking();
        } else {
            cancelTracking();
        }
    });

    var startTracking = function () {
        document.body.onmousemove = function trackingMouseEvent(ev) {
            currentMousePosition = {
                x: ev.layerX,
                y: ev.layerY,
            };
        };

        document.body.onscroll = function trackingScrollEvent(ev) {
            currentScrollPosition = document.body.scrollTop;
        };

        timerTracking = setInterval(function () {
            if (lastMousePosition != currentMousePosition || lastScrollPosition != currentScrollPosition) {
                trackingData.push({
                    x: currentMousePosition.x,
                    y: currentMousePosition.y,
                    scroll: currentScrollPosition,
                    path: window.location.pathname + window.location.hash + window.location.search,
                    timestamp: +new Date()
                });

                lastMousePosition = currentMousePosition;
                lastScrollPosition = currentScrollPosition;
            }
        }, 250);

        timerSync = setInterval(function () {
            if (trackingData.length > 0) {
                var dataCopy = trackingData.slice();
                trackingData = [];
                var ref = firebase.database().ref("tracking");
                for (var i = 0; i < dataCopy.length; i++) {
                    ref.push(dataCopy[i]);
                }
            }
        }, 5000);
    }

    var cancelTracking = function () {
        if (timerTracking != null) {
            clearInterval(timerTracking);
            timerTracking = null;
        }
        if (timerSync != null) {
            clearInterval(timerSync);
            timerSync = null;
        }
        document.querySelector('body').onmousemove = null;
        trackingData = [];
        authChangedCalled = false;
        currentMousePosition = {};
    }

}());
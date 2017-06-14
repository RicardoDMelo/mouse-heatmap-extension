"use strict";

(function () {
    var timerMouseMovement = null;
    var timerSync = null;
    var trackingData = [];
    var authChangedCalled = false;
    var currentMousePosition = {
        x: 0,
        y: 0
    };
    var lastMousePosition = {
        x: 0,
        y: 0
    };
    var currentScrollPosition = document.body.scrollTop;
    var lastScrollPosition = document.body.scrollTop;
    var sessionToken = null;
    var uid = null;
    var domainName = util.replaceAll(window.location.hostname, ".", "-")

    var startTracking = function () {
        document.body.onmousemove = function trackingMouseEvent(ev) {
            currentMousePosition = {
                x: ev.layerX,
                y: ev.layerY,
            };
        };

        document.body.onclick = function trackingClickEvent(ev) {
            currentMousePosition = {
                x: ev.layerX,
                y: ev.layerY,
            };
            trackingData.push({
                eventType: 3,
                eventDescription: 'click',
                timestamp: +new Date(),
                x: currentMousePosition.x,
                y: currentMousePosition.y,
                scroll: currentScrollPosition,
                height: window.innerHeight,
                width: window.innerWidth,
                path: window.location.pathname + window.location.hash + window.location.search
            });
        };

        window.onfocus = function trackingFocusEvent(ev) {
            trackingData.push({
                eventType: 4,
                eventDescription: 'focus',
                timestamp: +new Date(),
                x: currentMousePosition.x,
                y: currentMousePosition.y,
                scroll: currentScrollPosition,
                height: window.innerHeight,
                width: window.innerWidth,
                path: window.location.pathname + window.location.hash + window.location.search
            });
        };

        window.onblur = function trackingBlurEvent(ev) {
            trackingData.push({
                eventType: 5,
                eventDescription: 'blur',
                timestamp: +new Date(),
                x: currentMousePosition.x,
                y: currentMousePosition.y,
                scroll: currentScrollPosition,
                height: window.innerHeight,
                width: window.innerWidth,
                path: window.location.pathname + window.location.hash + window.location.search
            });
        };

        document.body.onscroll = function trackingScrollEvent(ev) {
            currentScrollPosition = document.body.scrollTop;
            if (lastScrollPosition != currentScrollPosition) {
                trackingData.push({
                    eventType: 2,
                    eventDescription: 'scroll',
                    timestamp: +new Date(),
                    x: currentMousePosition.x,
                    y: currentMousePosition.y,
                    scroll: currentScrollPosition,
                    height: window.innerHeight,
                    width: window.innerWidth,
                    path: window.location.pathname + window.location.hash + window.location.search
                });
                lastScrollPosition = currentScrollPosition;
            }
        };

        timerMouseMovement = setInterval(function () {
            if (lastMousePosition != currentMousePosition) {
                trackingData.push({
                    eventType: 1,
                    eventDescription: 'mouse',
                    timestamp: +new Date(),
                    x: currentMousePosition.x,
                    y: currentMousePosition.y,
                    scroll: currentScrollPosition,
                    height: window.innerHeight,
                    width: window.innerWidth,
                    path: window.location.pathname + window.location.hash + window.location.search
                });

                lastMousePosition = currentMousePosition;
                lastScrollPosition = currentScrollPosition;
            }
        }, 350);

        timerSync = setInterval(function () {
            if (trackingData.length > 0) {
                var dataCopy = trackingData.slice();
                var updatedData = {};
                trackingData = [];
                var ref = firebase.database().ref();
                
                updatedData['sites/' + domainName] = true;
                updatedData['users/' + domainName + '/' + uid] = true;
                updatedData['sessions/' + domainName + '/' + uid + '/' + sessionToken] = true;                
                ref.update(updatedData, function (er) {
                    if (er) {
                        util.error(er);
                    }
                });

                var eventRef = ref.child('events/' + domainName + '/' + uid + '/' + sessionToken);
                for (var i = 0; i < dataCopy.length; i++) {
                    eventRef.push(dataCopy[i]);
                }
            }
        }, 1000);
    }

    var cancelTracking = function () {
        if (timerMouseMovement != null) {
            clearInterval(timerMouseMovement);
            timerMouseMovement = null;
        }
        if (timerSync != null) {
            clearInterval(timerSync);
            timerSync = null;
        }
        document.querySelector('body').onmousemove = null;
        trackingData = [];
        authChangedCalled = false;
        currentMousePosition = {
            x: 0,
            y: 0
        };
        lastMousePosition = {
            x: 0,
            y: 0
        };
        currentScrollPosition = document.body.scrollTop;
        lastScrollPosition = document.body.scrollTop;
        sessionToken = null;
        uid = null;
    }

    firebase.auth().onAuthStateChanged(function (user) {
        if (authChangedCalled == false) {
            authChangedCalled = true;
            return;
        }
        if (user) {
            util.log("Authenticated!");
            sessionToken = user.refreshToken;
            uid = util.readCookie('trackUID');
            startTracking();
        } else {
            cancelTracking();
        }
    });

}());
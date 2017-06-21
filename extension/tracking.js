"use strict";

(function () {
    var timerMouseMovement = null;
    var timerSync = null;
    var trackingData = [];
    var authChangedCalled = false;
    var currentPrintUrl = null;
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
                x: ev.pageX,
                y: ev.pageY,
            };
        };

        timerMouseMovement = setInterval(function () {
            if (lastMousePosition != currentMousePosition) {
                pushNewEvent(1, 'mouse');
                lastMousePosition = currentMousePosition;
                lastScrollPosition = currentScrollPosition;
            }
        }, 200);

        var scrollTimer = null;
        document.body.onscroll = function trackingScrollEvent(ev) {
            currentScrollPosition = document.body.scrollTop;
            if (lastScrollPosition != currentScrollPosition) {
                pushNewEvent(2, 'scroll');
                lastScrollPosition = currentScrollPosition;

                if (scrollTimer !== null) {
                    clearTimeout(scrollTimer);
                }
                scrollTimer = setTimeout(function () {
                    chrome.runtime.sendMessage({
                        message: 'print'
                    });
                }, 150);
            }
        };

        document.body.onclick = function trackingClickEvent(ev) {
            currentMousePosition = {
                x: ev.pageX,
                y: ev.pageY,
            };
            pushNewEvent(3, 'click');
        };

        window.onfocus = function trackingFocusEvent(ev) {
            pushNewEvent(4, 'focus');
        };

        window.onblur = function trackingBlurEvent(ev) {
            pushNewEvent(5, 'blur');
        };

        chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
            var printHeight = currentScrollPosition;
            var storage = firebase.storage();
            var storageRef = storage.ref();
            var imageRef = storageRef.child('images/' + sessionToken + '-' + printHeight + '.jpg');
            imageRef.getDownloadURL()
                .then(function (url) {
                    util.log('Print already exists: ' + url);
                    currentPrintUrl = url;
                })
                .catch(function () {
                    var blob = util.b64toBlob(msg.dataUrl.substr(23));
                    var uploadTask = imageRef.put(blob);
                    uploadTask.on('state_changed', function (snapshot) {}, function (error) {
                        util.error(error);
                    }, function () {
                        util.log('Upload completed: ' + uploadTask.snapshot.downloadURL);
                        currentPrintUrl = uploadTask.snapshot.downloadURL;

                        var ref = firebase.database().ref();
                        var eventRef = ref.child('prints/' + domainName + '/' + uid + '/' + sessionToken);
                        eventRef.push({
                            path: 'images/' + sessionToken + '-' + printHeight + '.jpg',
                            height: printHeight
                        });
                    });
                });
        });

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
        currentPrintUrl = null;
    }

    var pushNewEvent = function (typeId, typeDescription) {
        trackingData.push({
            eventType: typeId,
            eventDescription: typeDescription,
            timestamp: +new Date(),
            x: currentMousePosition.x,
            y: currentMousePosition.y,
            scroll: currentScrollPosition,
            height: document.body.scrollHeight,
            width: document.body.scrollWidth,
            path: window.location.pathname + window.location.hash + window.location.search
        });
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
/*global $, window, firebase*/
"use strict";

(function () {
    var accessToken = null;
    var siteList = document.getElementById('sites-list');
    var userList = document.getElementById('users-list');
    var sessionList = document.getElementById('sessions-list');
    var trackingLog = document.getElementById('tracking-log');
    var connStatus = document.getElementById('conn-status');
    var buttonEvents = document.getElementById('generate-heat');
    var windowContainer = document.getElementById('window-container');
    var container = document.getElementById('heatmap-container');
    var sites = [];
    var users = [];
    var sessions = [];

    var getWebsites = function () {
        var siteList = document.getElementById('sites-list');

        firebase.database().ref('/sites').once('value')
            .then(function (snapshot) {
                util.log("Firebase connected.");
                connStatus.textContent = 'Firebase connected.';
                sites = Object.keys(snapshot.val());
                component.bindSelect(siteList, sites);
                siteList.onchange = onSiteChanged;
            })
    }

    var onSiteChanged = function () {
        component.bindSelect(userList, []);
        component.bindSelect(sessionList, []);
        var siteSelected = siteList.selectedIndex > 0 ? siteList.options[siteList.selectedIndex].value : 'null';

        if (siteSelected != 'null') {
            firebase.database().ref('/users/' + siteSelected).once('value')
                .then(function (snapshot) {
                    users = Object.keys(snapshot.val());
                    component.bindSelect(userList, users);
                    userList.onchange = onUserChanged;
                })
            buttonEvents.disabled = false;
        } else {
            component.bindSelect(userList, []);
            component.bindSelect(sessionList, []);
            buttonEvents.disabled = true;
        }
    }

    var onUserChanged = function () {
        component.bindSelect(sessionList, []);
        var siteSelected = siteList.selectedIndex > 0 ? siteList.options[siteList.selectedIndex].value : 'null';
        var userSelected = userList.selectedIndex > 0 ? userList.options[userList.selectedIndex].value : 'null';

        if (siteSelected != 'null' && userSelected != 'null') {
            firebase.database().ref('/sessions/' + siteSelected + '/' + userSelected).once('value')
                .then(function (snapshot) {
                    sessions = Object.keys(snapshot.val());
                    component.bindSelect(sessionList, sessions);
                })
        } else {
            component.bindSelect(sessionList, []);
        }
    }

    var getEvents = function () {
        var siteSelected = siteList.selectedIndex > 0 ? siteList.options[siteList.selectedIndex].value : 'null';
        var userSelected = userList.selectedIndex > 0 ? userList.options[userList.selectedIndex].value : 'null';
        var sessionSelected = sessionList.selectedIndex > 0 ? sessionList.options[sessionList.selectedIndex].value : 'null';
        if (sessionSelected != 'null') {
            firebase.database().ref('/events/' + siteSelected + '/' + userSelected + '/' + sessionSelected).once('value')
                .then(function (snapshot) {
                    var events = util.valuesToArray(snapshot.val());
                    generateHeatMap(events);
                })

            firebase.database().ref('/prints/' + siteSelected + '/' + userSelected + '/' + sessionSelected).once('value')
                .then(function (snapshot) {
                    var prints = util.valuesToArray(snapshot.val());
                    displayPrints(prints);
                })
        } else if (userSelected != 'null') {
            firebase.database().ref('/events/' + siteSelected + '/' + userSelected).once('value')
                .then(function (snapshot) {
                    var eventSessions = util.valuesToArray(snapshot.val());
                    var events = [];
                    eventSessions.forEach(function (element) {
                        events = events.concat(util.valuesToArray(element));
                    });
                    generateHeatMap(events);
                })

            firebase.database().ref('/prints/' + siteSelected + '/' + userSelected).once('value')
                .then(function (snapshot) {
                    var printsSessions = util.valuesToArray(snapshot.val());
                    var prints = [];
                    printsSessions.forEach(function (element) {
                        prints = prints.concat(util.valuesToArray(element));
                    });
                    displayPrints(prints);
                })
        } else {
            firebase.database().ref('/events/' + siteSelected).once('value')
                .then(function (snapshot) {
                    var eventUsers = util.valuesToArray(snapshot.val());
                    var eventSessions = [];
                    var events = [];
                    eventUsers.forEach(function (sessionsTmp) {
                        eventSessions = eventSessions.concat(util.valuesToArray(sessionsTmp));
                    });
                    eventSessions.forEach(function (element) {
                        events = events.concat(util.valuesToArray(element));
                    });
                    generateHeatMap(events);
                })

            firebase.database().ref('/prints/' + siteSelected).once('value')
                .then(function (snapshot) {
                    var printsUsers = util.valuesToArray(snapshot.val());
                    var printSessions = [];
                    var prints = [];
                    printsUsers.forEach(function (sessionsTmp) {
                        printSessions = printSessions.concat(util.valuesToArray(sessionsTmp));
                    });
                    printSessions.forEach(function (element) {
                        prints = prints.concat(util.valuesToArray(element));
                    });
                    displayPrints(prints);
                })
        }
    }

    var displayPrints = function (prints) {
        var storageRef = firebase.storage().ref();
        prints.forEach(function (element) {
            var imageRef = storageRef.child(element.path);
            imageRef.getDownloadURL()
                .then(function (url) {
                    var preview = document.createElement('img');
                    preview.style.position = 'absolute';
                    preview.style.top = element.height + 'px';
                    preview.style.left = '0';
                    preview.style.zIndex = '-2';
                    preview.src = url;
                    document.getElementById('heatmap-container').appendChild(preview);
                });
        }, this);
    }

    var generateHeatMap = function (events) {
        var eventsMove = _.filter(events, function (el) {
            return el.eventType == 1;
        });
        var eventsClick = _.filter(events, function (el) {
            return el.eventType == 3;
        });
        var eventsJson = JSON.stringify(events, null, 4);
        trackingLog.textContent = eventsJson;

        component.clearContainer(container);
        // if (eventsMove[0].windowWidth > window.innerWidth * 0.8) {
        //     var newWidth = window.innerWidth * 0.8;
        //     windowContainer.style.width = newWidth + 'px';
        //     windowContainer.style.height = ((newWidth * eventsMove[0].windowHeight) / eventsMove[0].windowWidth) + 'px';
        // } else {
        windowContainer.style.width = eventsMove[0].windowWidth + 'px';
        windowContainer.style.height = eventsMove[0].windowHeight + 'px';
        // }
        container.style.width = eventsMove[0].width + 'px';
        container.style.height = eventsMove[0].height + 'px';

        var heatmapInstance = h337.create({
            container: container,
            radius: 50
        });

        var lastX = null;
        var lastY = null;
        eventsMove.forEach(function (element) {
            var value = 30;
            if (lastX == element.x && lastY == element.y) {
                value = 1;
            }
            heatmapInstance.addData({
                x: element.x,
                y: element.y,
                value: value
            });
            lastX = element.x;
            lastY = element.y;
        }, this);
        eventsClick.forEach(function (element) {
            heatmapInstance.addData({
                x: element.x,
                y: element.y,
                value: 30
            });
            var preview = document.createElement('div');
            preview.style.position = 'absolute';
            preview.style.top = element.y + 'px';
            preview.style.left = element.x + 'px';
            preview.style.zIndex = '2';
            preview.style.border = '3px solid #2b78ff';
            preview.style.background = 'white';
            preview.style.height = '10px';
            preview.style.width = '10px';
            document.getElementById('heatmap-container').appendChild(preview);
        }, this);
    }

    buttonEvents.onclick = getEvents;
    component.bindSelect(siteList, []);
    component.bindSelect(userList, []);
    component.bindSelect(sessionList, []);

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            util.log("Authenticated.");
            accessToken = util.readCookie('accessTokenGoogle');
            getWebsites();
        } else {
            util.log("Auth Canceled.");
        }
    });
}());
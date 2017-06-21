/*global $, window, firebase*/
"use strict";

(function () {
    var accessToken = null;
    var siteList = document.getElementById('sites-list');
    var userList = document.getElementById('users-list');
    var sessionList = document.getElementById('sessions-list');
    var trackingLog = document.getElementById('tracking-log');
    var connStatus = document.getElementById('conn-status');

    var getWebsites = function () {
        var siteList = document.getElementById('sites-list');

        firebase.database().ref('/sites').once('value')
            .then(function (snapshot) {
                util.log("Firebase connected.");
                connStatus.textContent = 'Firebase connected.';
                var sites = Object.keys(snapshot.val());
                component.bindSelect(siteList, sites);
                siteList.onchange = onSiteChanged;
            })
    }

    var onSiteChanged = function () {
        component.bindSelect(userList, []);
        component.bindSelect(sessionList, []);
        var siteSelected = siteList.options[siteList.selectedIndex].value;

        firebase.database().ref('/users/' + siteSelected).once('value')
            .then(function (snapshot) {
                var users = Object.keys(snapshot.val());
                component.bindSelect(userList, users);
                userList.onchange = onUserChanged;
            })
    }

    var onUserChanged = function () {
        component.bindSelect(sessionList, []);
        var siteSelected = siteList.options[siteList.selectedIndex].value;
        var userSelected = userList.options[userList.selectedIndex].value;

        firebase.database().ref('/sessions/' + siteSelected + '/' + userSelected).once('value')
            .then(function (snapshot) {
                var sessions = Object.keys(snapshot.val());
                component.bindSelect(sessionList, sessions);
                sessionList.onchange = onSessionChanged;
            })
    }

    var onSessionChanged = function () {
        var siteSelected = siteList.options[siteList.selectedIndex].value;
        var userSelected = userList.options[userList.selectedIndex].value;
        var sessionSelected = sessionList.options[sessionList.selectedIndex].value;

        firebase.database().ref('/events/' + siteSelected + '/' + userSelected + '/' + sessionSelected).once('value')
            .then(function (snapshot) {
                var events = util.valuesToArray(snapshot.val());
                var eventsMove = _.filter(events, function (el) {
                    return el.eventType == 1;
                });
                var eventsClick = _.filter(events, function (el) {
                    return el.eventType == 3;
                });
                var eventsJson = JSON.stringify(events, null, 4);
                trackingLog.textContent = eventsJson;

                var container = document.getElementById('heatmap-container');
                container.style.width = events[0].width + 'px';
                container.style.height = events[0].height + 'px';
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                var heatmapInstance = h337.create({
                    container: container,
                    radius: 80
                });
                var lastX = null;
                var lastY = null;
                eventsMove.forEach(function (element) {
                    var value = 50;
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
            })

        firebase.database().ref('/prints/' + siteSelected + '/' + userSelected + '/' + sessionSelected).once('value')
            .then(function (snapshot) {
                var prints = util.valuesToArray(snapshot.val());
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
            })
    }

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
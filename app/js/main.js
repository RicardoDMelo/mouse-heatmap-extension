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
                var events = _.filter(util.valuesToArray(snapshot.val()), function (el) {
                    return el.eventType == 1;
                });
                var eventsJson = JSON.stringify(events, null, 4);
                util.log(eventsJson);
                trackingLog.textContent = eventsJson;
                var container = document.getElementById('heatmap-container');
                container.style.width = events[0].width + 'px';
                container.style.height = events[0].height + 'px';
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                var heatmapInstance = h337.create({
                    container: container,
                    radius: 90
                });
                events.forEach(function (element) {
                    heatmapInstance.addData({
                        x: element.x,
                        y: element.y,
                        value: 1
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
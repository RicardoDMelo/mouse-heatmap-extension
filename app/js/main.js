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
                bindSelect(siteList, sites);
                siteList.onchange = onSiteChanged;
            })
    }

    var onSiteChanged = function () {
        bindSelect(userList, []);
        bindSelect(sessionList, []);
        var siteSelected = siteList.options[siteList.selectedIndex].value;

        firebase.database().ref('/users/' + siteSelected).once('value')
            .then(function (snapshot) {
                var users = Object.keys(snapshot.val());
                bindSelect(userList, users);
                userList.onchange = onUserChanged;
            })
    }

    var onUserChanged = function () {
        bindSelect(sessionList, []);
        var siteSelected = siteList.options[siteList.selectedIndex].value;
        var userSelected = userList.options[userList.selectedIndex].value;

        firebase.database().ref('/sessions/' + siteSelected + '/' + userSelected).once('value')
            .then(function (snapshot) {
                var sessions = Object.keys(snapshot.val());
                bindSelect(sessionList, sessions);
                sessionList.onchange = onSessionChanged;
            })
    }

    var onSessionChanged = function () {
        var siteSelected = siteList.options[siteList.selectedIndex].value;
        var userSelected = userList.options[userList.selectedIndex].value;
        var sessionSelected = sessionList.options[sessionList.selectedIndex].value;

        firebase.database().ref('/events/' + siteSelected + '/' + userSelected + '/' + sessionSelected).once('value')
            .then(function (snapshot) {
                var events = snapshot.val();
                var eventsJson = JSON.stringify(events, null, 4);
                util.log(eventsJson);
                trackingLog.textContent = eventsJson;
            })
    }

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

    bindSelect(siteList, []);
    bindSelect(userList, []);
    bindSelect(sessionList, []);

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
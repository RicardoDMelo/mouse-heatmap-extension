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
    var useFrame = document.getElementById('use-frame');
    var sites = [];
    var users = [];
    var sessions = [];
    var heatmapInstance = null;
    var userSampleSize = 5;
    var sessionSampleSize = 5;

    var getWebsites = function () {
        var siteList = document.getElementById('sites-list');

        access.getSitesObject()
            .then(function (sites) {
                var values = Object.keys(sites);
                var alias = util.valuesToArray(sites);
                util.log("Firebase connected.");
                connStatus.textContent = 'Firebase connected.';
                component.bindSelectWithAlias(siteList, values, alias);
                siteList.onchange = onSiteChanged;
            })
    }

    var onSiteChanged = function () {
        component.bindSelect(userList, []);
        component.bindSelect(sessionList, []);
        var siteSelected = siteList.selectedIndex > 0 ? siteList.options[siteList.selectedIndex].value : 'null';

        if (siteSelected != 'null') {
            access.getUsers(siteSelected)
                .then(function (users) {
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
            access.getSessions(siteSelected, userSelected)
                .then(function (sessions) {
                    component.bindSelect(sessionList, sessions);
                })
        } else {
            component.bindSelect(sessionList, []);
        }
    }

    var getEvents = function () {
        component.clearContainer(container);
        component.clearContainer(trackingLog);
        var siteSelected = siteList.selectedIndex > 0 ? siteList.options[siteList.selectedIndex].value : 'null';
        var userSelected = userList.selectedIndex > 0 ? userList.options[userList.selectedIndex].value : 'null';
        var sessionSelected = sessionList.selectedIndex > 0 ? sessionList.options[sessionList.selectedIndex].value : 'null';
        if (sessionSelected != 'null') {
            heatmapInstance = null;
            //Recuperar eventos do usuário
            fetchEventsWithSession(siteSelected, userSelected, sessionSelected);
            if (useFrame.checked == true) {
                createFrame(siteSelected, userSelected, sessionSelected);
            } else {
                fetchPrintsWithSession(siteSelected, userSelected, sessionSelected);
            }

        } else if (userSelected != 'null') {
            heatmapInstance = null;
            //Recuperar eventos do usuário
            fetchEventsWithUser(siteSelected, userSelected);
            if (useFrame.checked == true) {
                createFrame(siteSelected, userSelected);
            } else {
                fetchPrintsWithUser(siteSelected, userSelected);
            }
        } else {
            heatmapInstance = null;
            //Recuperar eventos do usuário
            fetchEventsWithSite(siteSelected);
            if (useFrame.checked == true) {
                createFrame(siteSelected);
            } else {
                fetchPrintsWithSite(siteSelected);
            }
        }
    }

    var createFrame = function (siteSelected, userSelected, sessionSelected) {
        access.getRealUrl(siteSelected)
            .then(function (url) {
                util.log(url);

                var preview = document.createElement('iframe');
                preview.style.position = 'absolute';
                preview.style.top = '0';
                preview.style.left = '0';
                preview.style.zIndex = '-2';
                preview.style.width = container.style.width;
                preview.style.height = container.style.height;
                preview.src = 'https://' + url;
                document.getElementById('heatmap-container').appendChild(preview);
            })
    }

    var fetchEventsWithSession = function (siteSelected, userSelected, sessionSelected) {
        //Recuperar eventos da sessão
        access.getEventsFromSession(siteSelected, userSelected, sessionSelected)
            .then(function (events) {
                if (!heatmapInstance) {
                    generateHeatMap(events);
                } else {
                    addDataToHeatmap(events);
                }
            })
    }

    var fetchEventsWithUser = function (siteSelected, userSelected) {
        //Recuperar eventos do usuário
        access.getEventsFromUser(siteSelected, userSelected)
            .then(function (events) {
                if (!heatmapInstance) {
                    generateHeatMap(events);
                } else {
                    addDataToHeatmap(events);
                }
            })
    }

    var fetchEventsWithSite = function (siteSelected) {
        //Recuperar eventos do site
        access.getEventsFromSite(siteSelected)
            .then(function (events) {
                if (!heatmapInstance) {
                    generateHeatMap(events);
                } else {
                    addDataToHeatmap(events);
                }
            })
    }

    var fetchPrintsWithSite = function (siteSelected) {
        access.getPrints(siteSelected)
            .then(function (printsUsers) {
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

    var fetchPrintsWithUser = function (siteSelected, userSelected) {
        access.getPrints(siteSelected, userSelected)
            .then(function (printsSessions) {
                var prints = [];
                printsSessions = _.sample(printsSessions, printsSessions.length > sessionSampleSize ? sessionSampleSize : printsSessions.length);
                printsSessions.forEach(function (element) {
                    prints = prints.concat(util.valuesToArray(element));
                });
                displayPrints(prints);
            })
    }

    var fetchPrintsWithSession = function (siteSelected, userSelected, sessionSelected) {
        access.getPrints(siteSelected, userSelected, sessionSelected)
            .then(function (prints) {
                displayPrints(prints);
            })
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
        windowContainer.style.width = events[0].windowWidth + 'px';
        windowContainer.style.height = events[0].windowHeight + 'px';
        container.style.width = events[0].width + 'px';
        container.style.height = events[0].height + 'px';

        heatmapInstance = h337.create({
            container: container,
            radius: 50
        });
        addDataToHeatmap(events);
    }

    var addDataToHeatmap = function (events) {
        var eventsMove = _.filter(events, function (el) {
            return el.eventType == 1;
        });
        var eventsClick = _.filter(events, function (el) {
            return el.eventType == 3;
        });
        var eventsJson = JSON.stringify(events, null, 4);
        var content = document.createTextNode(eventsJson);
        trackingLog.appendChild(content);

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
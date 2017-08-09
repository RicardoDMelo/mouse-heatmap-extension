"use strict";

var access = (function () {

    var getEventsFromSession = function (site, user, session) {
        return firebase.database().ref('/sessionsevents/' + site + '/' + user + '/' + session).once('value')
            .then(function (snapshot) {
                var events = util.valuesToArray(snapshot.val());
                return events;
            });
    }

    var getEventsFromUser = function (site, user) {
        return firebase.database().ref('/usersevents/' + site + '/' + user).once('value')
            .then(function (snapshot) {
                var events = util.valuesToArray(snapshot.val());
                return events;
            });
    }

    var getEventsFromSite = function (site) {
        return firebase.database().ref('/sitesevents/' + site).once('value')
            .then(function (snapshot) {
                var events = util.valuesToArray(snapshot.val());
                return events;
            });
    }

    var getSessions = function (site, user) {
        return firebase.database().ref('/sessions/' + site + '/' + user).once('value')
            .then(function (snapshot) {
                var sessions = Object.keys(snapshot.val());
                return sessions;
            });
    }

    var getUsers = function (site) {
        return firebase.database().ref('/users/' + site).once('value')
            .then(function (snapshot) {
                var users = Object.keys(snapshot.val());
                return users;
            });
    }

    var getSites = function () {
        return firebase.database().ref('/sites').once('value')
            .then(function (snapshot) {
                var sites = Object.keys(snapshot.val());
                return sites;
            });
    }

    var getSitesObject = function () {
        return firebase.database().ref('/sites').once('value')
            .then(function (snapshot) {
                var sites = snapshot.val();
                return sites;
            });
    }

    var getRealUrl = function (site) {
        var url = '/sites/';
        if (site && site != '') {
            url += site;
        }
        return firebase.database().ref(url).once('value')
            .then(function (snapshot) {
                if (site && site != '') {
                    return snapshot.val();
                } else {
                    var sites = util.valuesToArray(snapshot.val());
                    return sites;
                }
            });
    }

    var getPrints = function (site, user, session) {
        var url = '/prints/';
        if (site && site != '') {
            url += site;
        }
        if (user && user != '') {
            url += ('/' + user);
        }
        if (session && session != '') {
            url += ('/' + session);
        }

        return firebase.database().ref(url).once('value')
            .then(function (snapshot) {
                var prints = util.valuesToArray(snapshot.val());
                return prints;
            });
    }

    return {
        getEventsFromSession: getEventsFromSession,
        getEventsFromUser: getEventsFromUser,
        getEventsFromSite: getEventsFromSite,
        getSessions: getSessions,
        getUsers: getUsers,
        getSites: getSites,
        getSitesObject: getSitesObject,
        getRealUrl: getRealUrl,
        getPrints: getPrints
    }
}());
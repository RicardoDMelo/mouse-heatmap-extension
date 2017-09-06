var fs = require('fs');
var access = require('./access');
var util = require('./util');
var writefile = require('./writefile');
var firebase = require('firebase');

var data = [];

util.log("App loaded!");

var config = {
    apiKey: "AIzaSyCDndBcDzb3D7QRu70mqG1Ij_R8nMiDRy8",
    authDomain: "mouse-heatmap.firebaseapp.com",
    databaseURL: "https://mouse-heatmap.firebaseio.com",
    storageBucket: "mouse-heatmap.appspot.com",
    projectId: "mouse-heatmap",
    messagingSenderId: "602527389876"
};

firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function (user) {
    if (user == null) {
        util.log("No Auth");
        firebase.auth().signInAnonymously();
    } else if (user && user.isAnonymous == true) {
        util.log("Authenticated.");
        doWhatever();
    } else {
        util.log("Auth Canceled.");
    }
});

var count = 0;

var doWhatever = function () {
    util.log("Firebase connected.");
    util.log("Starting fetch...");

    access.getSites().then(function (res1) {
        var sites = res1;
        sites.forEach(function (site) {
            access.getUsers(site).then(function (res2) {
                var users = res2;
                users.forEach(function (user) {
                    access.getSessions(site, user).then(function (res3) {
                        var sessions = res3;
                        sessions.forEach(function (session) {
                            access.getEventsFromSession(site, user, session).then(function (res4) {
                                var events = res4;
                                events.forEach(function (event) {
                                    event.session = session;
                                    event.user = user;
                                    event.site = site;
                                    data.push(event);
                                    var eventsJson = JSON.stringify(event, null, 4);
                                    eventsJson = eventsJson + ',';
                                    
                                    writefile(eventsJson);
                                }, this);
                                util.log('Session finished!');
                                util.log(count);
                                count++;
                            });
                        }, this);
                    });
                }, this);
            });
        }, this);
    });

}
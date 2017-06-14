/*global $, window, firebase*/
"use strict";

(function () {
    var accessToken = null;
    // var userId = firebase.auth().currentUser.uid;
    // firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
    //     var username = snapshot.val().username;
    //     // ...
    // });

    var getWebsites = function () {
        $.getJSON('https://mouse-heatmap.firebaseio.com/tracking/www-reddit-com.json?access_token=' + accessToken,
        // $.getJSON('https://mouse-heatmap.firebaseio.com/tracking/www-reddit-com.json',
            function (data) {
                alert(data);
            });
    }

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            util.log("Authenticated");
            accessToken = util.readCookie('accessTokenGoogle');
            getWebsites();
        } else {
            util.log("Auth Canceled");
        }
    });
}());
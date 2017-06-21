"use strict";

(function () {
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


    firebase.auth().getRedirectResult().then(function (result) {
        if (result.credential) {
            util.createCookie('accessTokenGoogle', result.credential.accessToken, 30);
        }
    }).catch(function (error) {
        util.error(error.message);
    });


    firebase.auth().onAuthStateChanged(function (user) {
        if (user == null || user.isAnonymous == true) {
            util.log("No Auth");
            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            firebase.auth().signInWithRedirect(provider);
        }
    });



}());
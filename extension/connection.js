"use strict";

(function () {
    util.log("Extension loaded!");
    if (util.readCookie('trackUID') == null) {
        util.createCookie('trackUID', util.generateUUID(), 1000);
    }
    var config = {
        apiKey: "AIzaSyCDndBcDzb3D7QRu70mqG1Ij_R8nMiDRy8",
        authDomain: "mouse-heatmap.firebaseapp.com",
        databaseURL: "https://mouse-heatmap.firebaseio.com",
        storageBucket: "mouse-heatmap.appspot.com",
        projectId: "mouse-heatmap",
        messagingSenderId: "602527389876"
    };

    firebase.initializeApp(config);
    firebase.auth().signInAnonymously().catch(function (error) {
        util.error(error.message);
    });

}());
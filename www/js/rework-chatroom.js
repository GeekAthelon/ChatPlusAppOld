/*global define */

define([], function () {
    "use strict";

    function getChatMarkers(doc) {
        var markers = [];
        return markers;
    }

    function upgrade() {
        window.alert("Upgrade ChatRoom");
    }

    return {
        getChatMarkers: getChatMarkers,
        upgrade: upgrade
    };
});

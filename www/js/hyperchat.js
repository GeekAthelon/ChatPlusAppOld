/*global define */

define([], function () {
    "use strict";

    var hyperchat = (function () {

        function getRoomName(doc) {
            var el = doc.getElementsByName("vqxro");
            if (el.length === 0) {
                return "<Other>";
            }

            var roomName = doc.getElementsByName("vqxro")[0].value;
            if (roomName === "c") {
                roomName = "<HotList>";
            }
            return roomName;
        }

        function isChatRoom(doc) {
            var chatBoxTo = doc.getElementsByName("vqxto")[0];

            return !!chatBoxTo;
        }

        return {
            getRoomName: getRoomName,
            isChatRoom: isChatRoom
        };
    }());

    return hyperchat;
});

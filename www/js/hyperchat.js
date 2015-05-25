/*global define */

define([], function () {
    "use strict";

    var hyperchat = (function () {

        function injectStyleRule(doc, cssText) {
            var css = doc.createElement("style");
            css.type = "text/css";
            if("textContent" in css) {
                css.textContent = cssText;
            } else {
                css.innerText = cssText;
            }
            doc.body.appendChild(css);
        }

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

        function isSoiPage(doc) {
            return isChatRoom(doc);
        }

        return {
            getRoomName: getRoomName,
            isSoiPage: isSoiPage,
            isChatRoom: isChatRoom,
            injectStyleRule: injectStyleRule
        };
    }());

    return hyperchat;
});

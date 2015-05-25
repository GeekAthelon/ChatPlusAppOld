/*global define */
/*global forEachNode */

define([], function () {
    "use strict";

    function getChatMarkers(doc) {
        var markers =  doc.querySelectorAll("hr + i + a ~ br ~ b");
        return markers;
    }

    //? = &#9668;
    //? = &#9658;
    //? = &#9660;
    //? = &#9650;


    function handleNicknameClick(e) {

        var target = e.target;
        while(target) {
            if (target.classList && target.classList.contains("cp-chatroom-nickname")) {
                break;
            }
            target = target.parentNode;
        }

        if (target) {
            e.preventDefault();
            window.alert("Touch on target");
        }

    }


    function upgrade(doc, settings) {
        var markers = getChatMarkers(doc);

        forEachNode(markers, function (marker) {

            var clone = marker.cloneNode(true);

            if (settings.decolorizeNicks.value) {
                var fonts = clone.querySelectorAll("font");
                forEachNode(fonts, function (font) {
                    font.color = "";
                });
            }

            var symbol = doc.createElement("span");
            symbol.classList.add("cp-chatroom-nickname");
            symbol.innerHTML="&#9660;&nbsp;" + clone.innerHTML;

            marker.style.display = "none";
            marker.parentNode.insertBefore(symbol, marker);
        });

        doc.body.addEventListener("click", handleNicknameClick, false);
    }

    var internal = {
        getChatMarkers: getChatMarkers,
    };

    return {
        internal: internal,
        upgrade: upgrade
    };
});

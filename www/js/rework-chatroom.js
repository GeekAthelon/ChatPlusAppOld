/*global define */
/*global forEachNode */

define([], function () {
    "use strict";

    function getChatMarkers(doc) {
        //doc.querySelectorAll("hr + i + a ~ br ~ b");
        // Because the text below the chat box can be EXTREMELY mangled, the browsers will
        // sometimes put really weird closing tags after the HR element, which means the
        // query selector breaks.
        //

        var markers = doc.querySelectorAll("i + a ~ br ~ b");
        return markers;
    }

    //? = &#9668;
    //? = &#9658;
    //? = &#9660;
    //? = &#9650;


    function handleNicknameClick(e) {

        var target = e.target;
        while (target) {
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


    function gatherLinks(srcElement) {
        var links = [];
        var anchors = srcElement.querySelectorAll("a");
        forEachNode(anchors, function (anchor) {
            if (anchor.href) {
                links.push(anchor.cloneNode(true));
            }
        });

        return links;
    }

    function makeQuickLinkAccess(doc, boxTable) {
        function handleQuickLinkClick(e) {
            e.preventDefault();
            var span = linkDiv.querySelector("span");
            if (!span.firstChildElement) {
                var links = gatherLinks(boxTable);
                span.innerHTML = "";
                forEachNode(links, function(link) {
                    span.appendChild(link);
                    span.appendChild(document.createTextNode(" "));
                });

                span.classList.add("visible");
            }
        }

        var template = document.getElementById("quick-link-template").innerHTML;
        var linkDiv = document.createElement("div");
        linkDiv.className = 'cp-chatroom-quick-links';
        linkDiv.innerHTML = template;
        boxTable.parentNode.insertBefore(linkDiv, boxTable);

        linkDiv.addEventListener("click", handleQuickLinkClick, false);
    }

    function shredChatBox(doc) {



        // The 'To:' field
        var boxTable = doc.getElementsByName("vqxto")[0];
        while (boxTable) {
            if (boxTable.tagName.toLowerCase() === "table") {
                break;
            }
            boxTable = boxTable.parentNode;
        }

        // One of the sister sites doesn't use the same layout, so bail out
        // if that happens.
        if (!boxTable) {
            return;
        }


        makeQuickLinkAccess(doc, boxTable);
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
            symbol.innerHTML = "&#9660;&nbsp;" + clone.innerHTML;

            marker.style.display = "none";
            marker.parentNode.insertBefore(symbol, marker);
        });

        shredChatBox(doc);
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

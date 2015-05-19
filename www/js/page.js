/*global define:true */
/*global Promise:true */
/*global forEachNode:true */

define(["text!html/templates/mainwindow.html", "ajax", "setting-manager", "stringFormat"],
    function (mainWindowTemplate, ajax, settingManager, stringFormat) {
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

            return {
                getRoomName: getRoomName
            };
        }());


        //***************************************************************************
        function setImagesToBlank(html) {

            // Yes, yes I know that normally it would be far better to simply
            // use DOM methods replace the 'src' attribute.  However, that would
            // involve attaching the HTML to the DOM, which would download the image
            // resources even if we were not going to use them.
            //
            // Hence, we are stuck with the search-and-replace in the HTML string
            // itself.

            return new Promise(function (resolve /*, reject  */) {

                var baseUrl = (function () {
                    var baseUrl = window.location.href.split("?")[0];
                    var bits = baseUrl.split("/");
                    bits.pop();
                    return bits.join("/");
                }());

                htmlToDom(html).then(function (el) {

                    // the `html` may not refer to a complete DOM document
                    // so the `el` element will, most likely, bear little
                    // resemblance to our original HTML.
                    // The images, however, do come out.

                    var hash = {};
                    var images = el.getElementsByTagName("img");
                    for (var i = 0; i < images.length; i++) {
                        var img = images[i];
                        hash[img.src] = img.alt;
                        //img.setAttribute("data-old-src", img.src);
                    }

                    Object.keys(hash).forEach(function (oldSrc) {
                        var newSrc = baseUrl + "/img/image-placeholder.png";
                        var oldStr;
                        var newStr;
                        var regex;
                        // Try the three different versions
                        newStr = "src='" + newSrc + "' data-old-src='" + oldSrc + "'";

                        // handle src=url
                        oldStr = "src=" + oldSrc;
                        regex = new RegExp(oldStr, 'g');
                        html = html.replace(regex, newStr);

                        // handle src='url'
                        oldStr = "src='" + oldSrc + "'";
                        regex = new RegExp(oldStr, 'g');
                        html = html.replace(regex, newStr);

                        // handle src="url"
                        oldStr = "src=\"" + oldSrc + "\"";
                        regex = new RegExp(oldStr, 'g');
                        html = html.replace(regex, newStr);
                    });

                    resolve(html);
                }).catch(function (err) {
                    window.alert("setImagesInHtmlStringToBlank error: " + JSON.stringify(err));
                });
            });
        }

//*****************************************************************************

        function htmlToDom(html) {
            return new Promise(function (resolve /*, reject  */) {
                var doc = document.implementation.createHTMLDocument("example");
                doc.documentElement.innerHTML = html;
                resolve(doc);
            });
        }

        function copyHtmlStringToDest(html, dest) {
            htmlToDom(html).then(function (doc) {
                document.body.innerHTML = "";

                var node = doc.body.firstChild;
                while (node) {
                    if (node.tagName && node.tagName.toLowerCase() === "script") {
                        node.parentNode.removeChild(node);
                    } else if (false && node.tagName && node.tagName.toLowerCase() === "link") {
                        node.parentNode.removeChild(node);
                    } else {
                        dest.appendChild(node);
                    }
                    node = doc.body.firstChild;
                }
            });
        }

        function relativeUrlToAbsolute(url, base_url) {
            var doc = document,
                old_base = doc.getElementsByTagName('base')[0],
                old_href = old_base && old_base.href,
                doc_head = doc.head || doc.getElementsByTagName('head')[0],
                our_base = old_base || doc_head.appendChild(doc.createElement('base')),
                resolver = doc.createElement('a'),
                resolved_url;

            our_base.href = base_url;
            resolver.href = url;
            resolved_url = resolver.href; // browser magic at work here

            if (old_base) {
                old_base.href = old_href;
            } else {
                doc_head.removeChild(our_base);
            }
            return resolved_url;
        }

        function finalizePage(baseUrl, doc) {
            function handleLinkClick(e) {
                e.preventDefault();

                var link = e.target;
                while (link.tagName.toLowerCase() !== "a") {
                    link = link.parentNode;
                }

                if (!link) {
                    return;
                }

                var href = link.href;
                var url = href.split('?')[0];

                ajax.get(href).then(function (html) {
                    return copyPageToDom(url, html);
                }).catch(function (error) {
                    window.alert("Error: " + error);
                });
            }

            var links = doc.links;
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                var oldUrl = link.href;
                var queryString = oldUrl.split("?")[1];

                link.href = relativeUrlToAbsolute(baseUrl, oldUrl);
                if (queryString) {
                    link.href += "?" + queryString;
                }
            }

            doc.body.addEventListener("click", handleLinkClick, false);
        }

        function copyPageToDom(url, html) {
            function addToTabs(iframe, doc) {

                function showTab(roomName) {
                    var frames = document.querySelectorAll("[data-iframe-room-name]");
                    for (var i = 0; i < frames.length; i++) {
                        hideIframe(frames[i]);
                    }

                    highlightTab(roomName);

                    var iframe = document.querySelector("[data-iframe-room-name='" + roomName + "']");
                    resizeIframe(iframe);
                }

                function highlightTab(roomName) {
                    var buttons = document.querySelectorAll("#tab-names [data-room-name]");
                    forEachNode(buttons, function (button) {
                        button.classList.remove("active");
                        var buttonRoomName = button.getAttribute("data-room-name");

                        if (buttonRoomName === roomName) {
                            button.classList.add("active");
                        }
                    });
                }

                function handleTabButtonClick(e) {
                    /*jshint validthis:true */
                    var roomName = this.getAttribute("data-room-name");
                    showTab(roomName);
                }

                function hideIframe(iframe) {
                    // Under android, we can't use 'display:none' or the thing can't be scrolled
                    // when we come back to it.
                    iframe.style.height = "0px";
                    iframe.style.width = "0px";
                    iframe.style.top = "-10000px";
                    iframe.style.borderTop = "none";
                }

                function resizeIframe(iframe) {
                    var tabHeight = tabsHome.clientHeight;
                    var bodyHeight = document.body.clientHeight;
                    var newHeight = bodyHeight - tabHeight;

                    iframe.style.display = "block";
                    iframe.style.height = newHeight + "px";
                    iframe.style.width = "100%";
                    iframe.style.positon = "absolute";
                    iframe.style.top = "0px";
                    iframe.style.borderTop = tabHeight + "px solid green";
                }

                var tabsHome = document.getElementById("tab-names");
                var roomName = hyperchat.getRoomName(doc);

                var button = document.querySelector("#tab-names [data-room-name='" + roomName + "']");
                if (!button) {
                    button = document.createElement("button");
                    button.type = "button";
                    button.setAttribute("data-room-name", roomName);
                    button.appendChild(document.createTextNode(roomName));
                    tabsHome.appendChild(button);
                    button.addEventListener("click", handleTabButtonClick, false);
                }

                var oldIframe = document.querySelector("[data-iframe-room-name='" + roomName + "']");
                if (oldIframe) {
                    oldIframe.parentNode.removeChild(oldIframe);
                }

                iframe.setAttribute("data-iframe-room-name", roomName);

                resizeIframe(iframe);
                showTab(roomName);
            }


            return new Promise(function (resolve /*, reject  */) {
                setImagesToBlank(html).then(function (newHtml) {
                    var iframe = document.createElement("iframe");

                    document.body.appendChild(iframe);

                    iframe.onload = function () {
                        iframe.onload = null;
                        finalizePage(url, mydoc);

                        addToTabs(iframe, mydoc);

                        resolve();
                    };

                    var mydoc = iframe.contentWindow.document;
                    mydoc.write(newHtml);
                    //mydoc.write(html);
                    mydoc.close();
                }).catch(function (err) {
                    window.alert("Simplify failed: " + err);
                });

            });
        }

        function submit(url, data) {
            ajax.post(url, data).then(function (html) {
                return copyPageToDom(url, html);
            }).catch(function (error) {
                window.alert("Error: " + error);
            });
        }


        function closeSettings() {
            var settingsTab = document.getElementById("settings-tab");
            settingsTab.style.display = "none";
        }

        function handleSettingsCloseClick(e) {
            e.preventDefault();
            closeSettings();
        }

        function handleSettingsSaveClick(e) {
            e.preventDefault();

            settingManager.getSettingsList().then(function (settings) {

                Object.keys(settings).forEach(function (key, i) {
                    var item = settings[key];
                    if (item.type === "bool") {
                        item.value = document.getElementById(key).checked;
                    }
                });

                settingManager.saveSettingsList(settings);
                closeSettings();
            }).catch(function(err) {
                window.alert("handleSettingsSaveClick: " + err);
            });
        }

        function handleSettingsClick(e) {
            e.preventDefault();

            var promise = settingManager.getSettingsList();

            settingManager.getSettingsList().then(function (settings) {
                var ul = document.querySelector("#settings-tab ul");
                ul.innerHTML = "";
                var listHtml = [];

                Object.keys(settings).forEach(function (key, i) {
                    var item = settings[key];
                    var template = document.getElementById("settings-bool-template").innerHTML;

                    var s = stringFormat(template, {
                            key: key,
                            description: item.description,
                            checked: item.value ? "checked" : ""
                        }
                    );

                    listHtml.push(s);
                });
                ul.innerHTML = listHtml.join("\r\n");
            }).catch(function (err) {
                window.alert("Error in handleSettingsClick: " + err);
            });

            var settingsTab = document.getElementById("settings-tab");
            settingsTab.style.display = "block";
        }

        function wireupMainPage() {
            return new Promise(function (resolve /*, reject  */) {

                document.getElementById("tab-names-settings").addEventListener("click", handleSettingsClick, false);
                document.getElementById("settings-tab-close-button").addEventListener("click", handleSettingsCloseClick, false);
                document.getElementById("settings-tab-save-button").addEventListener("click", handleSettingsSaveClick, false);
                resolve();
            });
        }

        function firstSubmit(url, data) {
            ajax.post(url, data).then(function (html) {
                document.body.innerHTML = mainWindowTemplate;
                return copyPageToDom(url, html);
            }).then(function () {
                return wireupMainPage();
            }).catch(function (error) {
                window.alert("Error: " + error);
            });
        }

        return {
            copyHtmlStringToDest: copyHtmlStringToDest,
            submit: submit,
            firstSubmit: firstSubmit,
            htmlToDom: htmlToDom,
            setImagesInHtmlStringToBlank: setImagesToBlank
        };
    }
);

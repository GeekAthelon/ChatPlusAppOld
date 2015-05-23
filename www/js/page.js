/*global define:true */
/*global Promise:true */
/*global forEachNode:true */

define(["text!html/templates/mainwindow.html", "ajax", "setting-manager", "stringFormat", "hyperchat",
        "rework-chatroom"],
    function (mainWindowTemplate, ajax, settingManager, stringFormat, hyperchat, chatroom) {
        "use strict";

        //***************************************************************************
        function setImagesToBlank(html) {

            function doReplace(html, oldStr, newStr) {
                var regex = new RegExp(oldStr, 'g');
                html = html.replace(regex, newStr);
                return html;
            }

            function mangleBackgroundAttributes(baseUrl, doc, html) {
                var elementsWithBackground = doc.querySelectorAll("[background]");

                var hash = {};
                for (var i = 0; i < elementsWithBackground.length; i++) {
                    var el = elementsWithBackground[i];
                    var val = el.getAttribute("background");
                    hash[val] = val;
                }

                Object.keys(hash).forEach(function (oldSrc) {
                    var oldStr;
                    var newStr;

                    // Try the three different versions
                    newStr = "data-old-background='" + oldSrc + "'";

                    // handle src=url
                    oldStr = "background=" + oldSrc;
                    html = doReplace(html, oldStr, newStr);

                    // handle src='url'
                    oldStr = "background='" + oldSrc + "'";
                    html = doReplace(html, oldStr, newStr);

                    // handle src="url"
                    oldStr = "background=\"" + oldSrc + "\"";
                    html = doReplace(html, oldStr, newStr);
                });

                return html;
            }

            function mangleImageElements(baseUrl, doc, html) {
                var images = doc.getElementsByTagName("img");
                var hash = {};
                for (var i = 0; i < images.length; i++) {
                    var img = images[i];
                    hash[img.src] = img.alt;
                    //img.setAttribute("data-old-src", img.src);
                }

                Object.keys(hash).forEach(function (oldSrc) {
                    var newSrc = baseUrl + "/img/image-placeholder.png";
                    var oldStr;
                    var newStr;

                    // Try the three different versions
                    newStr = "src='" + newSrc + "' data-old-src='" + oldSrc + "'";

                    // handle src=url
                    oldStr = "src=" + oldSrc;
                    html = doReplace(html, oldStr, newStr);

                    // handle src='url'
                    oldStr = "src='" + oldSrc + "'";
                    html = doReplace(html, oldStr, newStr);

                    // handle src="url"
                    oldStr = "src=\"" + oldSrc + "\"";
                    html = doReplace(html, oldStr, newStr);
                });

                return html;
            }

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

                settingManager.getSettingsList().then(function (settings) {

                    var mangleGraphics = settings.enableGraphicIcons.value || settings.enableGraphicSuppress.value;

                    if (!mangleGraphics) {
                        resolve(html);
                        return;
                    }

                    htmlToDom(html).then(function (doc) {

                        // the `html` may not refer to a complete DOM document
                        // so the `doc` element will, most likely, bear little
                        // resemblance to our original HTML.
                        // The images, however, do come out.

                        html = mangleImageElements(baseUrl, doc, html);
                        html = mangleBackgroundAttributes(baseUrl, doc, html);
                        resolve(html);
                    }).catch(function (err) {
                        window.alert("setImagesInHtmlStringToBlank error: " + err);
                    });

                });

            });
        }

//*****************************************************************************

        function collapseWidths(doc, settings) {
            var elements = doc.querySelectorAll("table, [data-old-background]");
            forEachNode(elements, function (element) {
               if (element.tagName.toLowerCase() === "table") {
                   element.width = "";
                   element.border = "0px";
               }
            });
        }

        function mangleImages(doc, settings) {

            // Static node list, not a fixed one.
            var images = doc.querySelectorAll("img");
            var altTemplate = document.getElementById("image-alt-text-template").innerHTML;

            forEachNode(images, function (image) {
                var span;
                var template;
                if (image.alt) {
                    template = altTemplate;
                    span = document.createElement("span");
                    span.innerHTML = stringFormat(template, {
                        text: image.alt
                    });

                    image.parentNode.replaceChild(span.firstElementChild, image);
                    return;
                }

                if (settings.enableGraphicSuppress.value) {
                    image.parentNode.removeChild(image);
                    return;
                }

            });
        }

        function removeCenterElement(doc, settings) {
            var centerElements = doc.querySelectorAll("center");

            forEachNode(centerElements, function (centerElement) {
                var div = document.createElement("div");
                while(centerElement.firstChild) {
                    div.appendChild(centerElement.firstChild);
                }

                centerElement.parentNode.replaceChild(div, centerElement);
            });
        }

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

                var settings;

                settingManager.getSettingsList().then(function (isettings) {
                    settings = isettings;
                    return setImagesToBlank(html);
                }).then(function (newHtml) {
                    var iframe = document.createElement("iframe");

                    document.body.appendChild(iframe);

                    iframe.onload = function () {
                        iframe.onload = null;
                        finalizePage(url, mydoc);

                        addToTabs(iframe, mydoc);

                        if (settings.enableRemoveCenter.value) {
                            removeCenterElement(mydoc, settings);
                        }

                        mangleImages(mydoc, settings);
                        collapseWidths(mydoc, settings);

                        if (hyperchat.isChatRoom(mydoc)) {
                            chatroom.upgrade();
                        }

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
            }).catch(function (err) {
                window.alert("handleSettingsSaveClick: " + err);
            });
        }

        function handleSettingsClick(e) {
            e.preventDefault();

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

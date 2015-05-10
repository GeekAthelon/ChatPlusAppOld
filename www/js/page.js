/*global define:true */
/*global Promise:true */

define(["text!html/templates/mainwindow.html", "ajax"], function (mainWindowTemplate, ajax) {
        "use strict";

        var hyperchat = (function () {

            function getRoomName(doc) {
                return doc.getElementsByName("vqxro")[0].value;
            }

            return {
                getRoomName: getRoomName
            };
        }());

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
                var roomName = hyperchat.getRoomName(doc);

                var li = document.querySelector("#tab-names [data-room-name='" + roomName + "']");
                if (!li) {
                    li = document.createElement("li");
                    li.setAttribute("data-room-name", roomName);
                    li.appendChild(document.createTextNode(roomName));
                    document.getElementById("tab-names").appendChild(li);
                }

                var oldIframe = document.querySelector("[data-iframe-room-name='" + roomName + "']");
                if (oldIframe) {
                    oldIframe.parentNode.removeChild(oldIframe);
                }
                iframe.setAttribute("data-iframe-room-name", roomName);
            }


            return new Promise(function (resolve /*, reject  */) {
                {
                    var iframe = document.createElement("iframe");

                    document.body.appendChild(iframe);

                    iframe.onload = function () {
                        iframe.onload = null;
                        finalizePage(url, mydoc);

                        addToTabs(iframe, mydoc);

                        resolve();
                    };

                    var mydoc = iframe.contentWindow.document;
                    mydoc.write(html);
                    mydoc.close();
                }
            });
        }

        function submit(url, data) {
            ajax.post(url, data).then(function (html) {
                return copyPageToDom(url, html);
            }).catch(function (error) {
                window.alert("Error: " + error);
            });
        }

        function firstSubmit(url, data) {
            ajax.post(url, data).then(function (html) {
                document.body.innerHTML = mainWindowTemplate;
                return copyPageToDom(url, html);
            }).catch(function (error) {
                window.alert("Error: " + error);
            });
        }

        return {
            copyHtmlStringToDest: copyHtmlStringToDest,
            submit: submit,
            firstSubmit: firstSubmit
        };
    }
);

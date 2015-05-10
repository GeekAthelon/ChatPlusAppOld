/*global define:true */
/*global Promise:true */

define(["ajax"], function (ajax) {

    "use strict";

    window.documentWriteDestId = "";

    var oldDocumentWrite = document.write;
    document.write = function (s) {
        var dest = document.getElementById(window.documentWriteDestId);
        dest.innerHTML += s;
    };

    function htmlToDom(html) {
        return new Promise(function (resolve /*, reject  */) {

            var doc = document.implementation.createHTMLDocument("example");
            doc.documentElement.innerHTML = html;
            resolve(doc);
        });
    }

    function injectScripts(scripts) {
        var promises = scripts.map(function (script) {

            if (script.src) {
                return ajax.get(script.src);
            }

            return new Promise(function (resolve /*, reject  */) {
                resolve(script.code);
            });
        });

        Promise.all(promises).then(function (codes) {
            codes.forEach(function (code, i) {
                //code = code.replace(/document.write/g, "DISALLOW DOCUMENT.WRITE");


                try {
                    window.documentWriteDestId = "document_write_" + i;
                    globalEval(code);
                } catch (err) {
                    window.alert("globalEval Error in script: " + scripts[i] + "\r\n" + err);
                }
            });

            var DOMContentLoaded_event = document.createEvent("Event");
            DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
            window.document.dispatchEvent(DOMContentLoaded_event);

            var evt = document.createEvent('Event');
            evt.initEvent('load', false, false);
            window.dispatchEvent(evt);
        });
    }

    function copyHtmlStringToDest(html, dest) {
        var scripts = [];
        htmlToDom(html).then(function (doc) {
            document.body.innerHTML = "";

            var node = doc.body.firstChild;
            while (node) {
                if (node.tagName && node.tagName.toLowerCase() === "script") {

                    var documentWriteDest = document.createElement("span");
                    documentWriteDest.id = "document_write_" + scripts.length;
                    dest.appendChild(documentWriteDest);

                    if (node.src) {
                        scripts.push({src: node.src});
                    } else {
                        scripts.push({code: node.textContent});
                    }
                    node.parentNode.removeChild(node);
                } else if (false && node.tagName && node.tagName.toLowerCase() === "link") {
                    node.parentNode.removeChild(node);
                } else {
                    dest.appendChild(node);
                }
                node = doc.body.firstChild;
            }

            window.setTimeout(function () {
                injectScripts(scripts);
            }, 1000);

        }).catch(function (err) {

        });
    }

    function submit(url, data) {
        ajax.post(url, data).then(function (html) {
            copyHtmlStringToDest(html, document.body);
        }).catch(function (error) {
            window.alert("Error: " + error);
        });
    }

    return {
        copyHtmlStringToDest: copyHtmlStringToDest,
        submit: submit
    };

});

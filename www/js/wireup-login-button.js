/*global define:true */
/*global Promise: true */


define(["text!html/templates/login.html", "ajax"], function (template, ajax) {
    "use strict";

    function htmlToDom(html) {
        return new Promise(function (resolve, reject) {

            var doc = document.implementation.createHTMLDocument("example");
            doc.documentElement.innerHTML = html;
            resolve(doc);
        });
    }


    function injectScripts(urls) {
        var promises = urls.map(function (url) {
            return ajax.get(url);
        });

        Promise.all(promises).then(function (codes) {
            codes.forEach(function (code, i) {
                try {
                    globalEval(code);
                } catch (err) {
                    window.alert("globalEval Error in script: " + urls[i] + "\r\n" + err);
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

    function transferHtml(html) {
        var scripts = [];
        htmlToDom(html).then(function (doc) {

            var txt = doc.body.innerHTML;
            document.body.innerHTML = "";

            var origScriptCount = doc.getElementsByTagName("script").length;

            var node = doc.body.firstChild;
            while (node) {
                var sib = node.nextSibling;

                if (true && node.tagName && node.tagName.toLowerCase() === "script") {
                    if (node.src) {
                        scripts.push(node.src);
                    }
                    node.parentNode.removeChild(node);
                } else if (false && node.tagName && node.tagName.toLowerCase() === "link") {
                    node.parentNode.removeChild(node);
                } else {
                    document.body.appendChild(node);
                }
                node = doc.body.firstChild;
            }

            //window.setTimeout(function () {
                injectScripts(scripts);
            //}, 500);

        }).catch(function (err) {

        });

    }

    function ajaxSubmit(e) {
        e.preventDefault();

        var url = "http://ssomf.hyperchat.com/cgi-bin/somf.exe";
        var form = document.forms[0];

        var serializePromise = ajax.serialize(form);

        serializePromise.then(function (data) {
            return ajax.post(url, data);
        }).then(function (html) {
            transferHtml(html);
        }).catch(function (error) {
            window.alert("Error: " + error);
        });
    }

    function handleClick() {
        document.body.innerHTML = template;
        var form = document.forms[0];
        form.addEventListener("submit", ajaxSubmit, false);
    }

    function init() {
        var button = document.getElementById("login-button");

        button.removeEventListener("click", handleClick, false);
        button.addEventListener("click", handleClick, false);

        window.addEventListener("load", function() {
            window.alert("init: load event called");
        }, false);
    }

    return {
        init: init
    };
});
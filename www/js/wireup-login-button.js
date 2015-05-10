/*global define:true */
/*global Promise: true */
/*global globalEval: true */

define(["text!html/templates/login.html", "ajax", "page"], function (template, ajax, page) {
    "use strict";


    function handleSubmit(e) {
        e.preventDefault();

        var url = "http://ssomf.hyperchat.com/cgi-bin/somf.exe";
        var form = document.forms[0];

        var serializePromise = ajax.serialize(form);
        serializePromise.then(function (data) {
            page.submit(url, data);
        });
    }

    function handleClick() {
        document.body.innerHTML = template;
        var form = document.forms[0];
        form.addEventListener("submit", handleSubmit, false);
    }

    function init() {
        var button = document.getElementById("login-button");

        button.removeEventListener("click", handleClick, false);
        button.addEventListener("click", handleClick, false);

        window.addEventListener("load", function () {
            //window.alert("init: load event called");
        }, false);
    }

    return {
        init: init
    };
});
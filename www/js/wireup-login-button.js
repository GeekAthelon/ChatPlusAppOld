/*global define:true */

define(["text!html/templates/login.html", "ajax"], function (template, ajax) {
    "use strict";


    function ajaxSubmit(e) {
        e.preventDefault();

        var form = document.forms[0];

        var serializePromise = ajax.serialize(form);

        serializePromise.then(function(data) {
            window.alert(data);
        }).catch(function(error) {
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
    }

    return {
        init: init
    };
});
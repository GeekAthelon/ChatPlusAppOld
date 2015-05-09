define(["text!html/templates/qunit.html"], function (template) {

    function clearTestStatus() {
        window.sessionStorage.setItem("isTesting", "false");
        window.location.reload();
    }

    function appendStopTest() {
        var partner = document.querySelector("#qunit-testrunner-toolbar button");

        if (!partner) {
            window.setTimeout(appendStopTest);
            return;
        }

        var html = '<button type="button">Stop Tests</button>';

        var span = document.createElement("span");
        span.innerHTML = html;
        partner.parentNode.insertBefore(span, partner.nextSibling);

        span.addEventListener("click", clearTestStatus, true);
    }

    function handleClick() {
        document.body.innerHTML = template;
        QUnit.start();
        window.sessionStorage.setItem("isTesting", "true");
        isTesting = true;
        appendStopTest();
    }

    function init() {
        var button = document.getElementById("qunit-button");

        button.removeEventListener("click", handleClick, true);
        button.addEventListener("click", handleClick, true);
    }

    function redraw(queryString) {
        handleClick();
    }

    function getIsTesting() {
        return window.sessionStorage.getItem("isTesting") === "true";
    }

    return {
        init: init,
        redraw: redraw,
        isTesting: getIsTesting
    };
});
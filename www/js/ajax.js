/* global define:true */
/* global Promise: true */

define([], function () {
    "use strict";

    function getQueryParams(qs) {
        qs = qs.split("+").join(" ");

        var params = {}, tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while ((tokens = re.exec(qs))) {
            params[decodeURIComponent(tokens[1])] =
                decodeURIComponent(tokens[2]);
        }

        return params;
    }


    function serialize(form) {
        return new Promise(function (resolve, reject) {

            if (!form || form.nodeName !== "FORM") {
                reject(new Error("Invalid node passed"));
                return;
            }
            var i, j, q = [];
            for (i = form.elements.length - 1; i >= 0; i = i - 1) {
                if (form.elements[i].name === "") {
                    continue;
                }
                switch (form.elements[i].nodeName) {
                    case 'INPUT':
                        switch (form.elements[i].type) {
                            case 'text':
                            case 'hidden':
                            case 'password':
                            case 'button':
                            case 'reset':
                            case 'submit':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                            case 'checkbox':
                            case 'radio':
                                if (form.elements[i].checked) {
                                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                }
                                break;
                            case 'file':
                                break;
                        }
                        break;
                    case 'TEXTAREA':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    case 'SELECT':
                        switch (form.elements[i].type) {
                            case 'select-one':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                            case 'select-multiple':
                                for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                    if (form.elements[i].options[j].selected) {
                                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                                    }
                                }
                                break;
                        }
                        break;
                    case 'BUTTON':
                        switch (form.elements[i].type) {
                            case 'reset':
                            case 'submit':
                            case 'button':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                        }
                        break;
                }
            }
            resolve(q.join("&"));
        });
    }


    function handleProxyResponse(resolve, reject, reply) {
        // The proxy server gives us EVERYTHING, including the
        // http headers.
        //
        // Since we're only using the browser for development,
        // testing and it isn't our main concern, let the chips
        // fall were they will and pass the response text along.
        //
        // Be nice and at least strip the headers off though.
        //
        var html = reply;

        var endOfHeaderMarker = reply.indexOf('\r\n\r\n');
        var headers = reply.substr(0, endOfHeaderMarker);
        html = html.substr(endOfHeaderMarker + 4);

        resolve(html);
    }

    function post(url, data) {

        var query = getQueryParams(document.location.search);
        var isUsingProxy = !!query.proxy_url;
        if (isUsingProxy) {
            url = query.proxy_url + "?url=" + url + "&mode=native&send_cookies=1&send_session=0&user_agent=nada" +
                "full_headers=1&full_status=1";
        }


        return new Promise(function (resolve, reject) {

            var xhr = new XMLHttpRequest();

            xhr.open('POST', url);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = handler;
            xhr.send(data);

            function handler() {
                /*jshint validthis:true */
                if (this.readyState === this.DONE) {

                    if (isUsingProxy) {
                        handleProxyResponse(resolve, reject, this.response);
                        return;
                    }

                    if (this.status === 200) {
                        resolve(this.response);
                    } else {
                        var msg = 'ajax.post: `' + url + '` failed with status: [' + this.status + ']';
                        reject(new Error(msg));
                    }
                }
            }
        });
    }

    function get(url) {
        var realurl = url;
        var query = getQueryParams(document.location.search);
        if (query.proxy_url) {
            url = query.proxy_url + "?url=" + encodeURIComponent(url) +
                "&mode=native&send_cookies=1&send_session=0&user_agent=nada";
        }

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', url);
            xhr.onreadystatechange = handler;
            //xhr.responseType = 'json';
            //xhr.setRequestHeader('Accept', 'application/json');
            xhr.send();

            function handler() {
                /*jshint validthis:true */
                if (this.readyState === this.DONE) {
                    if (this.status === 200) {
                        resolve(this.response);
                    } else {
                        var msg = 'get: `' + url + '` failed with status: [' + this.status + ']';
                        reject(new Error(msg));
                    }
                }
            }
        });
    }

    return {
        serialize: serialize,
        post: post,
        get: get
    };
});
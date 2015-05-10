/* global define:true */
/* global Promise: true */

define([], function () {
    "use strict";

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


    function post(url, data) {
        return new Promise(function (resolve, reject) {

            var xhr = new XMLHttpRequest();

            xhr.open('POST', url);
            xhr.onreadystatechange = handler;
            xhr.send(data);

            function handler() {
                /*jshint validthis:true */
                if (this.readyState === this.DONE) {
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
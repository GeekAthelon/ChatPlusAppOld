/*global requirejs:true */
/*global Promise:true */

requirejs(["text!html/templates/index.html", "wireup-qunit", "wireup-login-button"], function (html, wireQUnit, wireLogin) {
    "use strict";

    /*
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     */

    document.body.innerHTML = html;

    wireQUnit.init();
    wireLogin.init();

    var promise = new Promise(function (resolve, reject) {
        window.setTimeout(function () {
            resolve("Whatever");
            reject("Attempted connect timed out");
        }, 300);

        var app = {
            // Application Constructor
            initialize: function () {
                this.bindEvents();
            },
            // Bind Event Listeners
            //
            // Bind any events that are required on startup. Common events are:
            // 'load', 'deviceready', 'offline', and 'online'.
            bindEvents: function () {
                //noinspection JSCheckFunctionSignatures
                document.addEventListener('deviceready', this.onDeviceReady, false);

                document.addEventListener("load", function () {
                    window.alert("Page loaded!");
                }, false);

            },
            // deviceready Event Handler
            //
            // The scope of 'this' is the event. In order to call the 'receivedEvent'
            // function, we must explicitly call 'app.receivedEvent(...);'
            onDeviceReady: function () {
                app.receivedEvent('deviceready');
                resolve("device ready");
            },
            // Update DOM on a Received Event
            receivedEvent: function (id) {

            }
        };
        app.initialize();
    });

    promise.then(function (/*value*/) {
        document.querySelector('.received').setAttribute('style', 'display:block;');
        document.getElementById("login-button").style.display = "";
    }).catch(function (/*reason*/) {
        document.querySelector(".timed-out").setAttribute('style', 'display:block;');
    }).finally(function(/*reason*/) {
        document.querySelector('.listening').setAttribute('style', 'display:none;');
        document.getElementById("qunit-button").style.display = "";

        if (wireQUnit.isTesting()) {
            wireQUnit.redraw();
        }
    });
});
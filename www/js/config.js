/* global ES6Promise: true */
/* global require: true */

require.config({
    appDir: "../",
    baseUrl: "js",
    paths: {
        "text": "lib/text",
        "html": ".."
    },
    waitSeconds: 15
});

QUnit.config.autostart = false;

window.Promise = ES6Promise.Promise;

(function () {
    /* jshint strict: false */
    /* global self: true */
    /* global global: true */

    // Get a handle on the global object
    var local;
    if (typeof global !== 'undefined') {
        local = global;
    }
    else if (typeof window !== 'undefined' && window.document) {
        local = window;
    }
    else {
        local = self;
    }

    // It's replaced unconditionally to preserve the expected behavior
    // in programs even if there's ever a native finally.
    local.Promise.prototype['finally'] = function finallyPolyfill(callback) {
        var constructor = this.constructor;

        return this.then(function (value) {
            return constructor.resolve(callback()).then(function () {
                return value;
            });
        }, function (reason) {
            return constructor.resolve(callback()).then(function () {
                throw reason;
            });
        });
    };
}());

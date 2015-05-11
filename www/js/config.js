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

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    "use strict";

    window.alert(errorMsg + " : " + url + " : " + lineNumber);

    // Just let default handler run.
    return false;
};

var globalEval = (function () {

    var isIndirectEvalGlobal = (function (original, Object) {
        try {
            // Does `Object` resolve to a local variable, or to a global, built-in `Object`,
            // reference to which we passed as a first argument?
            return (1, eval)('Object') === original;
        }
        catch (err) {
            // if indirect eval errors out (as allowed per ES3), then just bail out with `false`
            return false;
        }
    })(Object, 123);

    if (isIndirectEvalGlobal) {

        // if indirect eval executes code globally, use it
        return function (expression) {
            return (1, eval)(expression);
        };
    }
    else if (typeof window.execScript !== 'undefined') {

        // if `window.execScript exists`, use it
        return function (expression) {
            return window.execScript(expression);
        };
    }

    // otherwise, globalEval is `undefined` since nothing is returned
})();


function forEachNode(nodelist, cb) {
    "use strict";
    var l = nodelist.length;

    for (var i = 0; i < l; i++) {
        var val = nodelist[i];
        cb.call(val, val, i, nodelist);
    }
}

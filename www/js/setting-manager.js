/*global define:true */
/*global require:true */
/*global Promise:true */

define([], function () {
    "use strict";

    var settings = {};

    function addSetting(key, defaultValue, type, description) {
        var option = {
            value: defaultValue,
            type: type,
            description: description
        };

        Object.freeze(option);
        settings[key] = option;
    }

    addSetting("enableGraphicIcons", "true", "bool", "Change graphics to icons");
    addSetting("enableGraphicSuppress", "true", "bool", "Suppress graphics entirely");
    addSetting("enableRemoveCenter", "true", "bool", "Block elements left instead of centering them.");

    function getItem(key, defaultValue) {
        return new Promise(function (resolve /*, reject  */) {

            var val;
            var jsonVal = window.localStorage.getItem(key);
            if (jsonVal === undefined) {
                val = defaultValue;
            } else {
                val = JSON.parse(jsonVal);
            }

            resolve(val);
        });
    }

    function setItem(key, val) {
        return new Promise(function (resolve /*, reject  */) {
            var val;
            var jsonVal = JSON.stringify(val);
            window.localStorage.setItem(key, jsonVal);

            resolve();
        });
    }

    function getSettingsList() {
        return new Promise(function (resolve /*, reject  */) {
            resolve(settings);
        });
    }

    return {
        getItem: getItem,
        setItem: setItem,
        getSettingsList: getSettingsList
    };
});
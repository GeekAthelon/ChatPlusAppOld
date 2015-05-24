/*global define:true */
/*global require:true */
/*global Promise:true */

define([], function () {
    "use strict";

    var settings = {};

    function addSetting(key, defaultValue, type, description) {
        var option = {
            key: key,
            value: defaultValue,
            type: type,
            description: description
        };

        //Object.freeze(option);
        settings[key] = option;
    }

    addSetting("enableGraphicIcons", "true", "bool", "Change graphics to icons");
    addSetting("enableGraphicSuppress", "true", "bool", "Suppress graphics entirely");
    addSetting("enableRemoveCenter", "true", "bool", "Block elements left instead of centering them.");
    addSetting("decolorizeNicks", "true", "bool", "Remove colors from nicknames for readability");

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
            var jsonVal = JSON.stringify(val);
            window.localStorage.setItem(key, jsonVal);
            resolve();
        });
    }

    function getSettingsList() {
        return new Promise(function (resolve /*, reject  */) {

            Object.keys(settings).forEach(function (key) {
                var jsonVal = window.localStorage.getItem(key);
                var val;

                if (jsonVal === undefined || jsonVal === "undefined") {
                    val = undefined;
                } else {
                    val = JSON.parse(jsonVal);
                }

                settings[key].value = val;
            });

            resolve(settings);
        });
    }

    function saveSettingsList(settings) {
        return new Promise(function (resolve /*, reject  */) {

            var promises = Object.keys(settings).map(function (key) {
                var setting = settings[key];
                return setItem(setting.key, setting.value);
            });

            Promise.all(promises).then(function () {
                resolve();
            });

        });
    }

    return {
        getItem: getItem,
        setItem: setItem,
        getSettingsList: getSettingsList,
        saveSettingsList: saveSettingsList
    };
});
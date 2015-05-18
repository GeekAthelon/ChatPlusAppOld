/*jshint unused: false */

/*global equal, module, test, deepEqual, notDeepEqual, notEqual, start, stop */
/*global require, requireBaseModules */
/* expect, ok */


require(["jquery", "shared/stringFormat"], function($, stringFormat) {
	"use strict";

	module("utils.stringFormat test", { });

	test("Basic substitution Tests", function() {
		var expectedResult = "Hello world";

		var str = "Hello {0}";
		var result = stringFormat(str, "world");
		equal(result, expectedResult, "One parameter");

		str = "Hello {0}";
		result = stringFormat(str, ["world"]);
		equal(result, expectedResult, "One element array");

		str = "{0} {1}";
		result = stringFormat(str, "Hello", "world");
		equal(result, expectedResult, "Two parameters");

		str = "{0} {1}";
		result = stringFormat(str, ["Hello", "world"]);
		equal(result, expectedResult, "Two element array");

		str = "{0} {1}";
		result = stringFormat(str, ["Hello", "world", "extra!"]);
		equal(result, expectedResult, "Two element array");
	});

	test("Brace substitution Tests", function() {
		var str = "Hello {{0}}";
		var result = stringFormat(str, "world");
		equal(result, "Hello {0}", "Double Braces");

		str = "{0} {1} {2}";
		result = stringFormat(str, "a", "{0}", "b");
		equal(result, "a {0} b", "{0} substitution");
	});

	test("Key/Value substitution Tests", function() {
		var expectedResult = "Hello world";

		var str = "Hello {key}";
		var result = stringFormat(str, {
			"key": "world"
		});
		equal(result, expectedResult, "One element object");

		str = "{key2} {key}";
		result = stringFormat(str, {
			"key": "world",
			"key2": "Hello"
		});
		equal(result, expectedResult, "Two element object");
	});

});




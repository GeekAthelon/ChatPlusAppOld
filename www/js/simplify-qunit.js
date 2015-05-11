/*global define:true */
/*global require:true */

define(["page"], function (page) {
    "use strict";

    QUnit.config.testTimeout = 2 * 1000;

    var testHtml = '<tr><td width="120" valign="top">' +
        '<img align="left" width="120" height="150" src="http://feistyangel.castlebeware.com/feistyone.jpg">' +
        '</td><td width="20">&nbsp;</td><td valign="top">' +
        '<p style="clear:both; margin:0px"><i>Rolled dice</i>: Roll #1</p>' +
        ' <p style="clear:both; margin:0px">Rolled dice in positions: 1,2,3,4,5</p>' +
        ' <p style="clear:both; margin:0px"></p><pre><pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d4.jpg" alt="4"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d4.jpg" alt="4"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5">' +
        '</pre><pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5">' +
        '</pre><pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5">' +
        '</pre></pre><p></p> <p style="clear:both; margin:0px"><i>Rolled dice</i>: Roll #2</p> ' +
        '<p style="clear:both; margin:0px">Rolled dice in positions: 1,2</p> ' +
        '<p style="clear:both; margin:0px"></p><pre><pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d3.jpg" alt="3">' +
        '</pre><pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d1.jpg" alt="1"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5"></pre>' +
        '</pre><p></p> ' +
        '<p style="clear:both; margin:0px"><i>Rolled dice</i>: Roll #3</p> ' +
        '<p style="clear:both; margin:0px">Rolled dice in positions: 1,2</p> ' +
        '<p style="clear:both; margin:0px"></p>' +
        '<pre><pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d1.jpg" alt="1"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d1.jpg" alt="1"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5"></pre>' +
        '<pre style="float:left; margin-left: 0.5em; margin-right: 0.5em;">' +
        '<img src="http://soiroom.hyperchat.com/dice/dice/small/d5.jpg" alt="5"></pre></pre>' +
        '<p></p> <p style="clear:both; margin:0px">Score: 17 points on 3 of a Kind</p> ' +
        '<span style="display:none" class="control_1431207697">" S T A R T G A M E :   t r u e "</span>' +
        '<span style="display:none" class="dice_data"></span></td></tr>';



    QUnit.module( "Strip Images" );
    QUnit.test( "a basic test example", function( assert ) {
        assert.ok( true, "this test is fine" );
    });

    QUnit.test( "Testing image stripping", function( assert ) {

        var done = assert.async();

        var div = document.createElement("div");
        div.innerHTML = testHtml;
        var images = div.getElementsByTagName("img");
        var imageLength = images.length;

        page.setImagesInHtmlStringToBlank(testHtml).then(function (newHtml) {

            var div = document.createElement("div");
            div.innerHTML = testHtml;
            var images = div.getElementsByTagName("img");
            var newImageLength = images.length;

            assert.deepEqual(imageLength, 16, "Images found" );
            assert.deepEqual(imageLength, newImageLength, "No Images Lost" );
            done();
        }).catch(function (err) {
            console.log("Test failed with an error");
            console.log(err);
        });

    });


    return {

    };
});

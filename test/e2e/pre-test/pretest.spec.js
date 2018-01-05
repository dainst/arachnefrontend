/**
 * A set of very basic checks to be performed before the testing starts
 * a fail will stop the whole testing process because there would be no use in continue
 * this will protect devs by getting confused on failing tests when their setup is not right
 */

var fs = require("fs");
var pretestmessage = require('../util/pretestmessage');
var devConfig = require(__dirname + "/../../../dist/config/dev-config.json");
var httpGet = require('../util/httpget');

describe('There', function() {

    beforeAll(pretestmessage.enable);

    var FEurl = browser.getProcessedConfig().value_.baseUrl;
    var BEurl = devConfig.backendUri;


    it('should be Arachne frontend present at  ' + FEurl, function() {

        var message = "Could not connect to a Arachne frontend on " + FEurl + ".\nMake sure your frontend is running and the URl is correctly specified on protractor.conf.js.";

        browser.get('/')
            .then(expect(element(by.css('*[ng-app]')).getAttribute('ng-app')).toEqualMsgCritical('arachne', message))
    });


    it('should be Arachne backend present at ' + BEurl, function(done) {

        var message = "Could not connect to a Arachne backend on " + BEurl + ".\nMake sure your backend is running and the URL is correctly specified in config/dev-config.json and recompiled after your last change.";

        httpGet(BEurl + '/info', 15)
            .then(function(result) {
                expect(result.statusCode).toEqualMsgCritical(200);
            })
            .then(done)
            .then(done.fail)
    })
});
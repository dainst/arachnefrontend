/**
 * A set of very basic checks to be performed before the testing starts
 * a fail will stop the whole testing process because there would be no use in continue
 * this will protect devs by getting confused on failing tests when their setup is not right
 */

var fs = require("fs");
var toEqualMsg = require('../util/toEqualMsg');
var httpGet = require('../util/httpget');
var devConfig = require(__dirname + "/../../../dist/config/dev-config.json");

describe('There', function() {

    beforeAll(toEqualMsg.enable);

    var FEurl = browser.getProcessedConfig().value_.baseUrl;
    var BEurl = devConfig.backendUri;


    it('should be an Arachne frontend present at  ' + FEurl, function(done) {

        var message = "Could not connect to an Arachne frontend on " + FEurl
            + ".\nMake sure your frontend is running and the URl is correctly specified on protractor.conf.js."
            + "#DIE#"; // triggers failfast

        httpGet(FEurl + '/', 15)
            .then(function(result) {
                var isError = (result.statusCode >= 400);
                expect(isError).toEqualMsg(false, message);
            })
            .then(browser.get('/'))
            .then(expect(element(by.css('*[ng-app]')).getAttribute('ng-app')).toEqualMsg('arachne', message))
            .then(done)
            .catch(function(err) {
                done.fail(message)
            })
    });

    it('should be an Arachne backend present at ' + BEurl, function(done) {

        var message = "Could not connect to an Arachne backend on " + BEurl
            + ".\nMake sure your backend is running and the URL is correctly specified in config/dev-config.json and recompiled after your last change."
            + "#DIE#"; // triggers failfast

        httpGet(BEurl + '/info', 15)
            .then(function(result) {
                var isError = (result.statusCode >= 400);
                expect(isError).toEqualMsg(false, message);
            })
            .then(done)
            .catch(function(err) {
                done.fail(message)
            })
    });

});
var EC = protractor.ExpectedConditions;
var promisedRequest = require('../util/promisedRequest');
var common = require('../common');
var config = require('../../../config/dev-config.json');


var exportPage = function() {

    this.cleanStack = function() {
        return promisedRequest("clean stack", 'get', {
            url: config.backendUri + '/export/clean',
            headers: {'Content-Type': 'application/json'},
            auth: common.getAuthData(),
            data: {
                outdated: false
            }
        });

    };

    this.load = function() {
        var url = '/admin/dataexport';
        return browser.get(url);
    };

    this.getJobClass = function() {
        var job = element(by.css('.export-job:first-child'));
        var ignoreSynchronization = browser.ignoreSynchronization;
        browser.ignoreSynchronization = true;
        return new Promise(function(resolve, reject) {
            browser.wait(EC.presenceOf(job), 250)
                .then(function() {
                    job.getAttribute('class')
                        .then(resolve)
                        .then(function() {
                            browser.ignoreSynchronization = ignoreSynchronization;
                        });
                })
                .catch(function() {
                    browser.ignoreSynchronization = ignoreSynchronization;
                    resolve("(no job found)");
                })
        });
    }

};

module.exports = new exportPage();

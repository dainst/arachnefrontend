fs = require('fs');

exports.config = {
    chromeDriver : '../../node_modules/chromedriver/lib/chromedriver/chromedriver',
    baseUrl: 'http://localhost:8082',
    specs: ['**/*.spec.js'],
    directConnect: true,
    exclude: [],
    multiCapabilities: [{
        browserName: 'chrome',
        chromeOptions : {
            args: ['--window-size=800,600'] // THIS!
        }
    }],
    allScriptsTimeout: 110000,
    getPageTimeout: 100000,
    framework: 'jasmine2',
    jasmineNodeOpts: {
        isVerbose: false,
        showColors: true,
        includeStackTrace: false,
        defaultTimeoutInterval: 400000
    },
    plugins: [{
        package: 'protractor-console-plugin',
        failOnWarning: false,
        failOnError: false, // TODO: turn back on when console errors are fixed
        logWarnings: true,
        exclude: []
    }],
    onPrepare: function() {
        // browser.manage().window().setSize(800, 600); does not to work on mac os

        var FailureScreenshotReporter = function() {

            this.specDone = function(spec) {
                if (spec.status === 'failed') {

                    browser.takeScreenshot().then(function (png) {
                        var stream = fs.createWriteStream('test/e2e-screenshots/'+spec.fullName.replace(/ /g,"_")+'.png');
                        stream.write(new Buffer(png, 'base64'));
                        stream.end();
                    });
                }
            }
        };

        jasmine.getEnv().addReporter(new FailureScreenshotReporter());
    }
};
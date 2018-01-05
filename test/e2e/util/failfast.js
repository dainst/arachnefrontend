/**
 * this is a "reporter" wich allows a brutal quick exit, if a defined class of matchers fails
 * reason: if we can't access a backend at all for example, there is no use in continuing with the testing
 */
function failfast() {

    this.failOnMatchers = ["toEqualMsgCritical"];

    function die() {

        browser.driver.quit().then(function () {

            // NOTE: To check WebDriver has quit:
            // `ps aux | grep "chromedriver\|webdriver"`

            // Exit with error code 1: quits WebDriver
            process.exit(1);
        });

    }

    function errorOut(result) {
        console.log('\x1b[31m%s\x1b[0m'," Critical pre-test failed: " + result.fullName);
        for(var i = 0; i < result.failedExpectations.length; i++) {
            console.log(result.failedExpectations[i].message);
        }
    }

    this.init = function() {
        var self = this;
        return {
            specDone: function(result) {
                if (result.status === 'failed') {
                    for(var i = 0; i < result.failedExpectations.length; i++) {
                        if ((self.failOnMatchers.indexOf(result.failedExpectations[i].matcherName) !== -1)) {
                            errorOut(result);
                            die();
                            break;
                        }
                    }
                }
            }
        };
    }
}

module.exports = new failfast();
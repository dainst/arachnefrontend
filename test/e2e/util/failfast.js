/**
 * this is a "reporter" wich allows a brutal quick exit, if message finishes with the String "#DIE#"
 * reason: if we can't access a backend at all for example, there is no use in continuing with the testing
 */
function failfast() {


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

    function isCritical(failedExpectation) {
        if (failedExpectation.message.substr(-5) === "#DIE#") {
            failedExpectation.message = failedExpectation.message.substr(0, failedExpectation.message.length - 5);
            return true;
        }
        return false;
    }



    this.init = function() {
        var self = this;
        return {
            specDone: function(result) {
                if (result.status === 'failed') {
                    for (var i = 0; i < result.failedExpectations.length; i++) {
                        if (isCritical(result.failedExpectations[i])) {
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
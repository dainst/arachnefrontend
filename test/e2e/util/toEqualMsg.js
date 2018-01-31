/**
 * this allows to send a custom error message
 *
 *
 * * both take a custom error message as second argument and behave like toEqual
 * * the only difference is the name. in combination with failfast.js failing toEqualMsgCritical-expectations will make the whole testing process stop
 *
 */

var pretestMessage = function() {

    // to be called in beforeAll
    this.enable = function () {

        var self = this;

        var compareWithMessage = function(util, customEqualityTesters) {
            return {
                compare: function (actual, expected, msg) {
                    if (expected === undefined) {
                        expected = '';
                    }
                    var result = {};
                    result.pass = util.equals(actual, expected, customEqualityTesters);

                    if ((!result.pass) && (msg)) {
                        result.message = msg;
                    }

                    return result;
                }
            }
        };


        var matchers = {
            toEqualMsg: compareWithMessage
        };

        jasmine.addMatchers(matchers);
    };
};

module.exports = new pretestMessage();
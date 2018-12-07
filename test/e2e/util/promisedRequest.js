var request = require('request');

/**
 * factory for functions wich wraps promise around requests
 *
 *
 * @param task
 * @param httpMethod - get, post etc.
 * @param data
 * @param auth (optional) {username: "", password: ""}
 * @returns {promisedRequestFactory}
 */


function promisedRequest(task, httpMethod, data, auth={}) {

    function isErrorCode(code) {
        return ([200, 201, 203, 204].indexOf(code) !== -1);
    }

    var promisedRequestFactory = function(value) {
        return new Promise(function promisedRequest(resolve, reject) {
            if (typeof request[httpMethod] !== "function") {
                reject("'" + httpMethod + "' is no valid http method!");
            }
            data = (typeof data === "function") ? data(value) : data;
            var r = request[httpMethod](data, function(error, response, body) {
                if (!error && isErrorCode(response.statusCode)) {
                    //console.log(task + " is done. Value is " + value);
                    var returner = (typeof body === "undefined") ? value : body;
                    resolve(returner);
                } else {
                    reject("Could not " + task + " (" + response.statusCode + "). ");
                }
            });
            if ((typeof auth.username !== "undefined") && (typeof auth.password !== "undefined")) {
                r.auth(auth.username, auth.password, true);
            }
        })
    };

    return promisedRequestFactory;

}

module.exports = promisedRequest;

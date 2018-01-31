/**
 * a simple ajax call for protractor
 * @param siteUrl
 */


function httpGet(siteUrl, timeout) {
    var http = require('http');

    timeout = timeout || 15;

    return new Promise(function(resolve, reject) {
        http.get(siteUrl, function(response) {

            var bodyString = '';

            response.setEncoding('utf8');

            response.on("data", function(chunk) {
                bodyString += chunk;
            });

            response.on('end', function() {
                resolve({
                    statusCode: response.statusCode,
                    bodyString: bodyString
                });
            });

            response.setTimeout(timeout, function() {
                reject("Got http.get timout after: " + timeout);
            });

            response.on('error', function(e) {
                reject("Got http.get error: " + e.message);
            })

        }).on('error', function(e) {
            reject("Got http.get error: " + e.message);
        });
    });

}

module.exports = httpGet;
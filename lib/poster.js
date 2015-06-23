/**
 * Author: Daniel M. de Oliveira
 */ 
var http = require('http');


module.exports.post = function(path,dataset){

    var datasetString = JSON.stringify(dataset);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': datasetString.length
    };

    var options = {
        host: 'localhost',
        port: 8080,
        path: path,
        method: 'POST',
        headers: headers
    };

    // Setup the request.  The options parameter is
    // the object we defined above.
    var req = http.request(options, function(res) {
    });

    req.write(datasetString);
    req.end();
}
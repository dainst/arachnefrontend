/**
 * Author: Daniel M. de Oliveira
 * 
 * A little helper to facilitate communication
 * with httParrot from within the UI tests.
 */ 
var http = require('http');

// httParrot default port
const PORT = 1236;

/**
 * dataset - the JSON object which should get sent to httParrot.
 * path - the registration key to which the dataset should be associated. 
 * 
 * Example:
 * path: '/configure/path/to/a/page'
 * dataset: { msg: 'Hi' }
 */
module.exports.post = function(path,dataset){

    var datasetString = JSON.stringify(dataset);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': datasetString.length
    };

    var options = {
        host: 'localhost',
        port: PORT,
        path: path,
        method: 'POST',
        headers: headers
    };

    var req = http.request(options, function(res) {
    });

    req.write(datasetString);
    req.end();
}
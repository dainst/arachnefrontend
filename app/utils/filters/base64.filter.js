angular.module('arachne.filters')

    .filter('base64', function () {
        return function (input) {
            // copied from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_1_–_escaping_the_string_before_encoding_it
            var output = btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
            return output;
        }
    });
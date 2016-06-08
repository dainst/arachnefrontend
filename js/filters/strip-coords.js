angular.module('arachne.filters')

    .filter('stripCoords', function () {
        return function (value) {
            if (value.indexOf("[") != -1 && value.charAt(value.length - 1) == "]") {
                return value.substr(0, value.indexOf("["));
            } else {
                return value;
            }
        }
    });
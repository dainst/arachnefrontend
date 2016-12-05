angular.module('arachne.filters')

    .filter('escapeSlashes', function () {
        return function (string) {
            return string.replace(/\//g, '\\/');
        }
    });
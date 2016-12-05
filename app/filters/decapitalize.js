angular.module('arachne.filters')

    .filter('decapitalize', function () {
        return function (input) {
            return (!!input) ? input.charAt(0).toLowerCase() + input.substr(1) : '';
        }
    });
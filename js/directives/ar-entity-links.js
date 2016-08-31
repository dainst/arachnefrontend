'use strict';

angular.module('arachne.directives')

    .directive('arEntityLinks', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'partials/directives/ar-entity-links.html'
        }
    });
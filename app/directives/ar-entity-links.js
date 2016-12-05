'use strict';

angular.module('arachne.directives')

    .directive('arEntityLinks', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'app/directives/ar-entity-links.html'
        }
    });
'use strict';

angular.module('arachne.directives')

    .directive('arEntityLinks', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'js/directives/ar-entity-links.html'
        }
    });
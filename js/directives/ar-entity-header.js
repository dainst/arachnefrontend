'use strict';

angular.module('arachne.directives')

    .directive('arEntityHeader', function() {
        return {
            scope: { entity: '=' },
            replace: true,
            templateUrl: 'partials/directives/ar-entity-header.html'
        }
    });
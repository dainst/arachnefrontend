'use strict';

angular.module('arachne.directives')

    .directive('arEntityHeader', function() {
        return {
            scope: { entity: '=' },
            replace: true,
            templateUrl: 'app/directives/ar-entity-header.html'
        }
    });
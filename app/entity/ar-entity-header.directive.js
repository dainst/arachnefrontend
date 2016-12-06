'use strict';

angular.module('arachne.directives')

    .directive('arEntityHeader', function() {
        return {
            scope: { entity: '=' },
            replace: true,
            templateUrl: 'app/entity/ar-entity-header.html'
        }
    });
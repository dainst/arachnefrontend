'use strict';

angular.module('arachne.directives')

    .directive('arEntityTitle', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'app/directives/ar-entity-title.html'
        }
    });
'use strict';

angular.module('arachne.directives')

    .directive('arEntityTitle', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'js/directives/ar-entity-title.html'
        }
    });
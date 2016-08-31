'use strict';

angular.module('arachne.directives')

    .directive('arEntityTitle', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'partials/directives/ar-entity-title.html'
        }
    });
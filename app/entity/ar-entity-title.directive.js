'use strict';

angular.module('arachne.directives')

    .directive('arEntityTitle', function() {
        return {
            scope: { entity: '=' },
            templateUrl: 'app/entity/ar-entity-title.html'
        }
    });
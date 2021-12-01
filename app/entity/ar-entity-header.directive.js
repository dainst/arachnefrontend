'use strict';

angular.module('arachne.directives')

    .directive('arEntityHeader', function() {
        return {
            scope: { entity: '=' },
            replace: true,
            template: require('./ar-entity-header.html')
        }
    });

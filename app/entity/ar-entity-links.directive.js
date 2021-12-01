'use strict';

angular.module('arachne.directives')

    .directive('arEntityLinks', function() {
        return {
            scope: { entity: '=' },
            template: require('./ar-entity-links.html')
        }
    });

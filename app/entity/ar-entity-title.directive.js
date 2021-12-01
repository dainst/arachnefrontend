'use strict';

angular.module('arachne.directives')

    .directive('arEntityTitle', function() {
        return {
            scope: { entity: '=' },
            template: require('./ar-entity-title.html')
        }
    });

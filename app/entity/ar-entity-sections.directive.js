'use strict';

angular.module('arachne.directives')

    .directive('arEntitySections', function() {
        return {
            link: function(scope) {
                scope.isArray = function isArray(value){
                if (angular.isArray(value)) {
                    if (value.length === 1) {
                        return false;
                    }
                    return true;
                }
                return false;
            }
            },
            scope: {
                entity: '='
            },
            templateUrl: 'app/entity/ar-entity-sections.html'
        }
    });
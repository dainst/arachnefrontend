'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author: Sebastian Cuy
 * @author: Jan G. Wieners
 */
    .directive('con10tShowIf', ['authService', function (authService) {
        return {
            restrict: 'E',
            scope: {
                datasetGroup: '@'
            },
            transclude: true,
            templateUrl: 'app/widgets/con10t-show-if.html',

            link: function(scope, element, attrs) {

                attrs.$observe('datasetGroup', function(value) {

                    scope.showContent = (authService.getDatasetGroups().indexOf(value) !== -1);
                });
            }
        }
    }]);
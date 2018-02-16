'use strict';

angular.module('arachne.widgets.map')

    .directive('arMapNav', ['searchService', 'authService', function(searchService, authService) {
        return {
            templateUrl: 'app/map/ar-map-nav.html',
            link: function(scope) {

                scope.$watch(function() {
                    scope.resultSize = searchService.getSize();
                    scope.currentQuery = searchService.currentQuery();
                    scope.user = authService.getUser();
                });
            }
        }}]);
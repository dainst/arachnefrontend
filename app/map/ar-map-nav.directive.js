'use strict';

angular.module('arachne.widgets.map')

    .directive('arMapNav', ['searchService', 'authService', function(searchService, authService) {
        return {
            templateUrl: 'app/map/ar-map-nav.html',
            link: function(scope) {

                scope.$watch(function() {
                    // because it does not return an object reference unlinke getUser or currentQuery
                    scope.resultSize = searchService.getSize();
                    scope.currentQuery = searchService.currentQuery();
                    scope.user = authService.getUser();
                });
            }
        }}]);
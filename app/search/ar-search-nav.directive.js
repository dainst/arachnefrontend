'use strict';

angular.module('arachne.directives')

    .directive('arSearchNav', function () {
        return {
            templateUrl: 'app/search/ar-search-nav.html',
            scope: true,
            link: function(scope) {
                scope.hidePagination = scope.hidePagination || false;
                scope.hideSortOptions = scope.hideSortOptions || false;
            }
        }
    });
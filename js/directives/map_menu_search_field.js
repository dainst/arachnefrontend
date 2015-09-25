'use strict';

angular.module('arachne.directives')

/**
 * @author: David Neugebauer
 */
.directive('arMapMenuSearchField', ['$location', 'searchService', 'mapService', function($location, searchService, mapService) {
return {
    restrict: 'A',
    scope: {
        heading: '@'
    },
    templateUrl: 'partials/directives/ar-map-menu-search-field.html',
    link: function(scope) {

        var route = $location.path().slice(1);
        var currentQuery = searchService.currentQuery();

        searchService.getCurrentPage().then(function() {
            scope.q = currentQuery.q
            if (scope.q == '*') scope.q = '';
        });

        scope.search = function(q) {
            if (q == '') q = '*';
            // remove coordinate and zoom params on new search to indicate that the map
            // should choose its default action when rendering the new objects' places
            var query = mapService.getMapQuery().setParam('q',q).removeParams(['lat', 'lng', 'zoom']);
            var path = '/' + route + query.toString();
            $location.url(path);
        };
    }
}
}]);
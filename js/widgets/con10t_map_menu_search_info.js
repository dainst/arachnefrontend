'use strict';

angular.module('arachne.widgets.directives')

/**
 * @author: David Neugebauer
 * @author: Daniel M. de Oliveira
 */
.directive('con10tMapMenuSearchInfo', ['$uibModal', '$location', 'searchService', 'placesService', 'mapService',
function($uibModal, $location, searchService, placesService, mapService) {
    return {
        restrict: 'A',
        scope: {
            // "grid" or "places", depending on the map's type, different
            // search results are required
            type: '@'
        },
        templateUrl: 'partials/widgets/con10t-map-menu-search-info.html',
        link: function(scope) {

            scope.currentQuery = searchService.currentQuery();

            // renders a modal that contains a link to the current map's view
            scope.showLinkModal = function() {
                // construct the link's reference from the current location and the map's query
                var host = $location.host();
                var port = $location.port();
                port = (port == 80) ? "" : ":"+port;
                var baseLinkRef = document.getElementById('baseLink').getAttribute("href");
                var path = $location.path().substring(1);

                if (scope.que)
                    var query=scope.que
                else
                    var query = mapService.getMapQuery(searchService.currentQuery()).toString();

                scope.linkText = host + port + baseLinkRef + path + query;

                var modalInstance = $uibModal.open({
                    templateUrl: 'partials/Modals/mapLink.html',
                    scope: scope
                });

                modalInstance.close = function(){
                    modalInstance.dismiss();
                };

                // Select and focus the link after the modal rendered
                modalInstance.rendered.then(function(what) {
                    var elem = document.getElementById('link-display');
                    elem.setSelectionRange(0, elem.firstChild.length);
                    elem.focus();
                })
            }

            var sizeListener = function(size){
                scope.viewportCount=size;
            };

            var queryListener = function(query) {
                scope.que=query;
            };

            // basic information about the search depends on the type of the map
            // (either a geogrid or a map with Place objects)
            scope.entityCount = null;
            scope.placesCount = null;
            if (scope.type == "grid") {
                mapService.setSizeListener(sizeListener);
                mapService.setQueryListener(queryListener);
                searchService.getCurrentPage().then(function () {
                    scope.entityCount = searchService.getSize();
                });
            } else if (scope.type == "places") {
                placesService.getCurrentPlaces().then(function(places) {
                    scope.entityCount = placesService.getEntityCount();
                    scope.placesCount = places.length;
                });
            }
        }
    }
}]);
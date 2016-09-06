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
        templateUrl: 'js/map/con10t_map_menu_search_info.html',
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

                var query;
                if (scope.que)
                    query=scope.que;
                else
                    query = mapService.getMapQuery(searchService.currentQuery()).toString();

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
            };

            function placesCount(entities) {

                if (mapService.underLimit()) {
                    var placesCount=placesService.makePlaces(entities,searchService.currentQuery().bbox.split(",")).length;
                    return placesCount;
                } else
                    return undefined;
            }

            var queryListener = function(entities) {
                // basic information about the search depends on the type of the map
                // (either a geogrid or a map with Place objects)

                scope.placesCount = placesCount(entities);
                scope.entityCount=searchService.getSize();

                // scope.que=mapService.getMapQuery(searchService.currentQuery()).toString();
                // scope.entityCount = searchService.getSize();
            };
            
            searchService.getCurrentPage().then(function(entities){
                scope.entitiesTotal = searchService.getSize();
                scope.entityCount = searchService.getSize();
                scope.placesCount = placesCount(entities);
                mapService.registerOnMoveListener(queryListener);
            });
        }
    }
}]);
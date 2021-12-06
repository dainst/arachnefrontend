import arEntityMap from './ar-entity-map.directive.js';
import arMapMarkerPopup from './ar-map-marker-popup.directive.js';
import arMapNav from './ar-map-nav.directive.js';
import con10tMapMenuBaselayer from './con10t-map-menu-baselayer.directive.js';
import con10tMapMenuFacetSearch from './con10t-map-menu-facet-search.directive.js';
import con10tMapMenuLegend from './con10t-map-menu-legend.directive.js';
import con10tMapMenuOverlays from './con10t-map-menu-overlays.directive.js';
import con10tMapMenuSearchField from './con10t-map-menu-search-field.directive.js';
import con10tMapMenuSearchInfo from './con10t-map-menu-search-info.directive.js';
import con10tMapMenuTranslocations from './con10t-map-menu-translocations.directive.js';
import con10tMapOverlays from './con10t-map-overlays.directive.js';
import con10tMap from './con10t-map.directive.js';
import heatmapPainter from './heatmap-painter.js';
import MapMenuController from './map-menu.controller.js';
import mapService from './map.service.js';
import Place from './place.prototype.js';
import placesPainter from './places-painter.js';
import placesService from './places.service.js';

export default angular.module('arachne.map', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider.state({ name: 'map', url: '/map?q&fq&view&sort&offset&limit&desc&bbox&ghprec', template: require('./map.html')});
    }])
    .directive('arEntityMap', ['$compile', 'Query', 'placesPainter', arEntityMap])
    .directive('arMapMarkerPopup', ['$location', 'Entity', 'searchScope', arMapMarkerPopup])
    .directive('con10tMapPopup', ['$location', 'Entity', 'searchScope', arMapMarkerPopup])
    .directive('arMapNav', ['searchService', 'authService', '$uibModal', '$location', 'mapService', arMapNav])
    .directive('con10tMapMenuBaselayer', ['searchService', 'mapService', con10tMapMenuBaselayer])
    .directive('con10tMapMenuFacetSearch', ['$location', 'searchService', 'mapService', 'arachneSettings', con10tMapMenuFacetSearch])
    .directive('con10tMapMenuLegend', con10tMapMenuLegend)
    .directive('con10tMapMenuOverlays', ['searchService', 'mapService', con10tMapMenuOverlays])
    .directive('con10tMapMenuSearchField', ['$location', 'searchService', 'mapService', '$window', con10tMapMenuSearchField])
    .directive('con10tMapMenuSearchInfo', ['searchService', 'mapService', con10tMapMenuSearchInfo])
    .directive('con10tMapMenuTranslocations', ['placesPainter', 'mapService', 'searchService', 'placesService', con10tMapMenuTranslocations])
    .directive('con10tMapOverlays', ['mapService', 'searchService', con10tMapOverlays])
    .directive('con10tMap', ['searchService', 'mapService', 'heatmapPainter', 'placesService', 'placesPainter', 'arachneSettings', con10tMap])
    .factory('heatmapPainter', heatmapPainter)
    .controller('MapMenuController', ['$scope', 'searchService', MapMenuController])
    .factory('mapService', [ 'searchService' , mapService])
    .factory('Place', Place)
    .factory('placesPainter', ['$compile', 'Place', '$rootScope', placesPainter])
    .factory('placesService', ['searchService', 'Place', placesService])
;

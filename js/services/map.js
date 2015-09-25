'use strict';

/* Services */
angular.module('arachne.services')



/*
 * Provides a single leaflet map for different controllers/directives.
 * Provides convenience methods to alter the map's state.
 *
 * @author: David Neugebauer
 */
.factory('mapService', function(){

    var map = null;

    var overlays = null; // { key: LayerConfig }
    var activeOverlays = {}; // { key: TileLayer }

    var baselayers = null; // { key: LayerConfig }
    var activeBaselayer = null; // TileLayer
    var activeBaselayerKey = "";

    return {

        // initialize the Map given an Attribute id of an
        // HTML-Element.
        // Params are the same as those of Learflet's L.map():
        // http://leafletjs.com/reference.html#map-constructor
        // Returns the map governed by the mapService.
        initializeMap: function(id, options) {
            map = L.map(id, options);
            L.Icon.Default.imagePath = 'img';
            return map;
        },

        // Returns the map governed by mapService.
        getMap: function() {
            return map;
        },

        // Increases the map's zoom level or decreases it if the
        // increment is negative.
        increaseZoom: function(increment) {
            var lvl = map.getZoom();
            lvl = lvl + increment;
            if (lvl < 1) {
                lvl = 1;
            }
            map.setZoom(lvl);
        },

        // Sets the overlays available for this map
        // { key: LayerConfig, ... }
        setOverlays: function(overlaysToSet) {
            overlays = overlaysToSet;
        },

        // Sets the baselayers available for this map
        // { key: LayerConfig, ... }
        setBaselayers: function(baselayersToSet) {
            baselayers = baselayersToSet;
        },

        // Adds an overlay to the map
        activateOverlay: function(key) {
            var layerConfig = overlays[key];
            if (layerConfig && layerConfig.type == 'wms') {
                activeOverlays[key] = L.tileLayer.wms(layerConfig.url, layerConfig.layerOptions);
                map.addLayer(activeOverlays[key]);
            }
        },

        // Removes the old baselayer if neccessary and sets a new one
        // identified by it's key
        activateBaselayer: function(key) {
            if (activeBaselayer) {
                map.removeLayer(activeBaselayer);
            }

            var layerConfig = baselayers[key];
            activeBaselayer = L.tileLayer(layerConfig.url, layerConfig.layerOptions);
            activeBaselayerKey = key;
            map.addLayer(activeBaselayer);
        },

        // Removes an overlay from the map
        // TODO: Keep layer for later refresh
        deactivateOverlay: function(key) {
            map.removeLayer(activeOverlays[key]);
            delete activeOverlays[key];
        },

        // Toggle an overlay on the map, identified by key
        toggleOverlay: function(key) {
            if(activeOverlays[key]) {
                this.deactivateOverlay(key);
            } else {
                this.activateOverlay(key);
            }

        },

        /**
         * Returns a Query object copied from currentQuery and
         * enriched with all parameters needed to recreate the current map
         */
        getMapQuery: function(query) {
            var newQuery = query.removeParams('lat', 'lng', 'zoom', 'overlays', 'baselayers');

            newQuery.zoom = map.getZoom();
            newQuery.lat = map.getCenter().lat;
            newQuery.lng = map.getCenter().lng;

            var overlays = [];
            for (var key in activeOverlays) {
                overlays.push(key);
            }
            if (overlays.length > 0) {
                newQuery.overlays = overlays;
            }

            if (activeBaselayerKey != "") {
                newQuery.baselayer = activeBaselayerKey;
            }

            return newQuery;
        }
    }
});
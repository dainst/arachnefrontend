'use strict';

angular.module('arachne.widgets.map')

/*
 * Provides a single leaflet map for different controllers/directives.
 * Provides convenience methods to alter the map's state.
 *
 * @author: David Neugebauer
 * @author: Daniel de Oliveira
 */
.factory('mapService', [ 'searchService' , function (searchService) {

    var map = null;
    var overlays = null; // { key: LayerConfig }
    var activeOverlays = {}; // { key: TileLayer }

    var baselayers = {
        'osm': {
            'name': 'OpenStreetMap',
            'type': 'xyz',
            'url': 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
            'yayerOptions': {
                'subdomains': ['a', 'b', 'c'],
                'attribution': '&copy; <a href=\'http://www.opencyclemap.org\'>OpenCycleMap</a>, &copy; <a href=\'http://www.openstreetmap.org/copyright\'>OpenStreetMap</a> contributors',
                'continuousWorld': false,
                'maxZoom': 18
            }
        }
    }; // { key: LayerConfig }
    var activeBaselayer = 'osm'; // TileLayer
    var activeBaselayerKey = "";

    var popupOpen = false;

    var onMoveListeners = [];
    var limit = undefined;



    /**
     * Guesses a good geohash precision value from the zoomlevel
     * "zoom". The returned value can be used as "ghprec"-param in
     * search queries
     */
    var getGhprecFromZoom = function () {
        var zl = map.getZoom();

        var ghprecForZoomLevel =
            [3,3,3,3,4,4,5,5,6,6,6,7,7,8,8,8,9,9,9];

        if (zl > 18) zl = 18;
        return ghprecForZoomLevel[zl];
    };


    var bBoxFromBounds = function (bounds) {
        var southEast = bounds.getSouthEast();
        var northWest = bounds.getNorthWest();
        return [northWest.lat, northWest.lng, southEast.lat, southEast.lng].join(',');
    };


    var getCurrentPage = function () {

        if (!limit) {
            console.warn("no limit defined")
        }

        searchService.currentQuery().fl=limit;
        searchService.currentQuery().bbox = bBoxFromBounds(map.getBounds());
        searchService.currentQuery().ghprec = getGhprecFromZoom();
        searchService.currentQuery().limit = limit;
        searchService.markDirty(); 
        return searchService.getCurrentPage();
    };


    var feedListenersWithUpdates = function (entities) {
        for (var i in onMoveListeners)
            onMoveListeners[i](entities);
    };

    var _activateOverlay = function(key){
        var layerConfig = overlays[key];
        if (layerConfig && layerConfig.type == 'wms') {
            activeOverlays[key] = L.tileLayer.wms(layerConfig.url, layerConfig.layerOptions);
            map.addLayer(activeOverlays[key]);
        }
    };

    // Removes an overlay from the map
    var _deactivateOverlay = function (key) {
        map.removeLayer(activeOverlays[key]);
        delete activeOverlays[key];
    };
    

    return {


        bBoxFromBounds: function (bounds) {
            return _bBoxFromBounds(bounds);
        },

        registerOnMoveListener: function (oml) {
            onMoveListeners.push(oml);
        },

        setLimit: function(lim) {
            limit = lim;
        },
        
        underLimit: function() {
            var facetGeo = searchService.getFacet("facet_geo");
            return (facetGeo && facetGeo.values.length < limit);
        },
        

        /**
         * Initialize the Map given an Attribute id of an
         * HTML-Element.
         *  Params are the same as those of Learflet's L.map():
         * http://leafletjs.com/reference.html#map-constructor
         *
         * TODO: This thing here should absolutely not return the map object. Instead the service should encapsulate it.
         * @return the map governed by the mapService.
         */
        initializeMap: function (id, options) {
            map = L.map(id, options);
            L.Icon.Default.imagePath = 'img';

            // Disable dragging functionality if outside of container bounds
            L.Draggable.prototype._freeze = false;
            L.Draggable.prototype._updatePosition = function () {
                if (this._freeze) {
                    return;
                }

                this.fire('predrag');
                L.DomUtil.setPosition(this._element, this._newPos);
                this.fire('drag');
            };

            map.on('mouseout', function () {
                map.dragging._draggable._freeze = true;
            });
            map.on('mouseover', function () {
                map.dragging._draggable._freeze = false;
            });
            // / Disable dragging functionality if outside of container bounds


            
            
            map.on('popupopen', function(e) {
                popupOpen=true;
            });

            map.on('popupclose', function(e) {
                popupOpen=false;
                getCurrentPage().then(feedListenersWithUpdates);
            });
            
            map.on('moveend', function () {
                if (!popupOpen) getCurrentPage().then(feedListenersWithUpdates);
            });

            // see comment in apidoc above
            return map;
        },

        // Returns the map governed by mapService.
        getMap: function () {
            return map;
        },

        // Increases the map's zoom level or decreases it if the
        // increment is negative.
        increaseZoom: function (increment) {
            var lvl = map.getZoom();
            lvl = lvl + increment;
            if (lvl < 1) {
                lvl = 1;
            }
            map.setZoom(lvl);
        },

        // Sets the overlays available for this map
        setOverlays: function (ols) {

            var result = {};
            // overlays are either grouped at .groups
            if (ols && ols.groups) {
                for (var i = 0; i < ols.groups.length; i++) {
                    var group = ols.groups[i];

                    for (var j = 0; j < group.overlays.length; j++) {
                        var overlay = group.overlays[j];
                        result[overlay.key] = overlay;
                    }
                }
                // or just listed directly
            } else if (ols) {
                for (var i = 0; i < ols.length; i++) {
                    var overlay = ols[i];
                    result[overlay.key] = overlay;
                }
            }
            overlays=result;
        },

        // Sets the baselayers available for this map
        // { key: LayerConfig, ... }
        setBaselayers: function (baselayersToSet) {
            if (baselayersToSet) {
                baselayers = baselayersToSet;
            }
        },

        // which overlays are to be created is given by their keys in the URL
        activateOverlays: function(keys) {
            for (var i = 0; i < keys.length; i++) {
                _activateOverlay(keys[i]);
            }
        },

        // Removes the old baselayer if neccessary and sets a new one
        // identified by it's key
        activateBaselayer: function (key) {
            if (activeBaselayer) {
                map.removeLayer(activeBaselayer);
            }

            var layerConfig = baselayers[key];
            activeBaselayer = L.tileLayer(layerConfig.url, layerConfig.layerOptions);
            activeBaselayerKey = key;
            map.addLayer(activeBaselayer);
        },

        // Toggle an overlay on the map, identified by key
        toggleOverlay: function (key) {
            if (activeOverlays[key]) {
                _deactivateOverlay(key);
            } else {
                _activateOverlay(key);
            }

        },

        /**
         * Set map view to center coords with zoomlevel
         */
        initializeView: function (lat, lng, zoom) {
            var lt = lat || 40;
            var lg = lng || -10;
            var zm = zoom || 3;
            map.setView([lt, lg], zm);
        },

        /**
         * Returns a Query object copied from currentQuery and
         * enriched with all parameters needed to recreate the current map
         * @param stripExtraParams boolean
         */
        getMapQuery: function (query, stripExtraParams) {

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

            if (stripExtraParams)
                return query.removeParams(['lat', 'lng', 'zoom', 'bbox', 'ghprec', 'baselayer']);

            return newQuery;
        }
    }
}]);
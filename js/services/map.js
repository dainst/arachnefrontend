'use strict';

angular.module('arachne.services')



/*
 * Provides a single leaflet map for different controllers/directives.
 * Provides convenience methods to alter the map's state.
 *
 * @author: David Neugebauer
 * @author: Daniel M. de Oliveira
 */
.factory('mapService', ['searchService'
    , function(searchService){

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

    var boxesListener = null;
    var sizeListener = null;
    var queryListener = null;

    var _getMapQuery= function(query,stripExtraParams) {
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
            return query.removeParams(['lat', 'lng', 'zoom','bbox','ghprec','baselayer']);
        return newQuery;
    }


    /**
     * Guesses a good geohash precision value from the zoomlevel
     * "zoom". The returned value can be used as "ghprec"-param in
     * search queries
     */
    var getGhprecFromZoom = function() {
        var zl=map.getZoom();

        var ghprecForZoomLevel =
            [1,1,2,2,2,2,3,3,3,4,4,5,5,6,6,6,7,7,7];

        if (zl>18) zl=18;
        return ghprecForZoomLevel[zl];
    };


    var _bBoxFromBounds = function(bounds) {
        var southEast = bounds.getSouthEast();
        var northWest = bounds.getNorthWest();
        return [northWest.lat, northWest.lng, southEast.lat, southEast.lng].join(',');
    };

    var feedListenersWithUpdates = function() {

        var cq = searchService.currentQuery();
        cq.bbox = _bBoxFromBounds(map.getBounds());
        cq.ghprec = getGhprecFromZoom();

        searchService.markDirty();
        searchService.getCurrentPage().then(function(){

            var boxesToDraw=null;
            var agg_geogrid = searchService.getFacet("agg_geogrid");
            if (agg_geogrid) boxesToDraw=agg_geogrid.values;

            if (queryListener) queryListener(_getMapQuery(searchService.currentQuery()).toString());
            if (boxesListener) boxesListener(getGhprecFromZoom(),_bBoxFromBounds(map.getBounds()),boxesToDraw);
            if (sizeListener)  sizeListener(searchService.getSize());
        });
    };

    return {


        bBoxFromBounds: function(bounds) {
            return _bBoxFromBounds(bounds);
        },

        registerQueryListener: function(ql){
            queryListener=ql;
        },

        registerSizeListener: function(sl) {
            sizeListener=sl;
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
        initializeMap: function(id, options, bl) {
            map = L.map(id, options);
            L.Icon.Default.imagePath = 'img';

            // Disable dragging functionality if outside of container bounds
            L.Draggable.prototype._freeze=false;
            L.Draggable.prototype._updatePosition= function () {
                if(this._freeze) {
                    return;
                }

                this.fire('predrag');
                L.DomUtil.setPosition(this._element, this._newPos);
                this.fire('drag');
            };

            map.on('mouseout', function() {
                map.dragging._draggable._freeze=true;
            });
            map.on('mouseover', function() {
                map.dragging._draggable._freeze=false;
            });
            // / Disable dragging functionality if outside of container bounds

            if (bl){
                boxesListener=bl;

                // Hook for redrawing the grid on zoom and move events
                map.on('moveend', function() {
                    feedListenersWithUpdates();
                });
            }

            // see comment in apidoc above
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
            if (baselayersToSet) {
                baselayers = baselayersToSet;
            }
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
         * Set map view to center coords with zoomlevel
         */
        initializeView: function(lat,lng,zoom) {
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
        getMapQuery: function(query,stripExtraParams) {
            return _getMapQuery(query,stripExtraParams);
        }
    }
}]);
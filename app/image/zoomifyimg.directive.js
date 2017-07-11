'use strict';

angular.module('arachne.directives')

    .directive('zoomifyimg', ['arachneSettings', '$http', '$sce', function (arachneSettings, $http, $sce) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {


                /*
                 * L.TileLayer.Zoomify display Zoomify tiles with Leaflet
                 *
                 * Developed for Leaflet 1.0-dev
                 *
                 * Based on the Leaflet.Zoomify (https://github.com/turban/Leaflet.Zoomify)
                 * from turban (https://github.com/turban)
                 *
                 */

                L.TileLayer.Zoomify = L.TileLayer.extend({
                    options: {
                        continuousWorld: true,
                        tolerance: 0.8
                    },
                    initialize: function (entityId, options) {

                        var options = L.setOptions(this, options);
                        this._entityId = entityId;

                        var imageSize = L.point(options.width, options.height),
                            tileSize = options.tileSize;

                        //Build the zoom sizes of the pyramid and cache them in an array
                        this._imageSize = [imageSize];
                        this._gridSize = [this._getGridSize(imageSize)];

                        //Register the image size in pixels and the grid size in # of tiles for each zoom level
                        while (parseInt(imageSize.x) > tileSize || parseInt(imageSize.y) > tileSize) {
                            imageSize = imageSize.divideBy(2).ceil();
                            this._imageSize.push(imageSize);
                            this._gridSize.push(this._getGridSize(imageSize));
                        }

                        //We built the cache from bottom to top, but leaflet uses a top to bottom index for the zoomlevel,
                        // so reverse it for easy indexing by current zoomlevel
                        this._imageSize.reverse();
                        this._gridSize.reverse();

                        //Register our max supported zoom level
                        options.maxNativeZoom = this._gridSize.length - 1;

                        //Register our bounds for this zoomify layer based on the maximum zoom
                        var southWest = map.unproject([0, options.height], options.maxNativeZoom);
                        var northEast = map.unproject([options.width, 0], options.maxNativeZoom);

                        options.bounds = new L.LatLngBounds(southWest, northEast);
                        map.setMaxBounds(options.bounds);
                    },

                    onAdd: function (map) {

                        L.TileLayer.prototype.onAdd.call(this, map);
                        var mapSize = map.getSize(),
                            zoom = this._getBestFitZoom(mapSize),
                            imageSize = this._imageSize[zoom],
                            center = map.options.crs.pointToLatLng(L.point(imageSize.x / 2, imageSize.y / 2), zoom);

                        map.setView(center, zoom, true);
                    },

                    //Calculate the grid size for a given image size (based on tile size)
                    _getGridSize: function (imageSize) {

                        var tileSize = this.options.tileSize;
                        return L.point(Math.ceil(imageSize.x / tileSize), Math.ceil(imageSize.y / tileSize));
                    },

                    _getBestFitZoom: function (mapSize) {

                        var tolerance = this.options.tolerance,
                            zoom = this._imageSize.length - 1,
                            imageSize;

                        while (zoom) {
                            imageSize = this._imageSize[zoom];
                            if (imageSize.x * tolerance < mapSize.x && imageSize.y * tolerance < mapSize.y) {
                                return zoom;
                            }
                            zoom--;
                        }

                        return zoom;
                    },

                    _tileShouldBeLoaded: function (tilePoint) {

                        var gridSize = this._gridSize[this._map.getZoom()];
                        return (tilePoint.x >= 0 && tilePoint.x < gridSize.x && tilePoint.y >= 0 && tilePoint.y < gridSize.y);
                    },

                    //Extend the add tile function to update our arbitrary sized border tiles
                    _addTile: function (tilePoint, container) {

                        var tilePos = this._getTilePos(tilePoint),
                            key = this._tileCoordsToKey(tilePoint),
                            imageSize = this._imageSize[this._getZoomForUrl()],
                            gridSize = this._gridSize[this._getZoomForUrl()],
                            tileSize = this.options.tileSize;

                        //Load the tile via the original leaflet code
                        L.TileLayer.prototype._addTile.call(this, tilePoint, container);
                        var tile = this._tiles[key].el,
                            zoom = this._map.getZoom();

                        if (tilePoint.x === gridSize.x - 1) {
                            tile.style.width = imageSize.x - (tileSize * (gridSize.x - 1)) + 'px';
                        }

                        if (tilePoint.y === gridSize.y - 1) {
                            tile.style.height = imageSize.y - (tileSize * (gridSize.y - 1)) + 'px';
                        }

                        L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome || L.Browser.android23);

                        //this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;
                        this._loadTile(tile, tilePoint);

                        if (tile.parentNode !== this._tileContainer) {
                            container.appendChild(tile);
                        }

                        return true;

                        //Get out imagesize in pixels for this zoom level and our grid size
                        var imageSize = this._imageSize[this._getZoomForUrl()],
                            gridSize = this._gridSize[this._getZoomForUrl()];

                        //The real tile size (default:256) and the display tile size (if zoom > maxNativeZoom)
                        var	realTileSize = L.GridLayer.prototype.getTileSize.call(this),
                            displayTileSize = L.TileLayer.prototype.getTileSize.call(this);

                        //Get the current tile to adjust
                        var key = this._tileCoordsToKey(coords),
                            tile = this._tiles[key].el;

                        //Calculate the required size of the border tiles
                        var scaleFactor = L.point(	(imageSize.x % realTileSize.x),
                            (imageSize.y % realTileSize.y)).unscaleBy(realTileSize);

                        //Update tile dimensions if we are on a border
                        if ((imageSize.x % realTileSize.x) > 0 && coords.x === gridSize.x - 1) {
                            tile.style.width = displayTileSize.scaleBy(scaleFactor).x + 'px';
                        }

                        if ((imageSize.y % realTileSize.y) > 0 && coords.y === gridSize.y - 1) {
                            tile.style.height = displayTileSize.scaleBy(scaleFactor).y + 'px';
                        }

                        this._loadTile(tile, coords);
                    },

                    // override to use XHR instead of regular image loading
                    _loadTile: function (tile, tilePoint) {

                        tile._layer = this;

                        //this._adjustTilePoint(tilePoint);
                        var imgUri = this.getTileUrl(tilePoint);
                        $http.get(imgUri, {responseType: 'arraybuffer'})
                            .success(function (data) {
                                    var blob = new Blob([data], {type: 'image/jpeg'});
                                    tile.src = window.URL.createObjectURL(blob);
                                }
                            );

                        this.fire('tileloadstart', {
                            tile: tile,
                            url: tile.src
                        });
                    },

                    getTileUrl: function (coords) {
                        return arachneSettings.dataserviceUri + '/image/zoomify/' + this._entityId + '/' + this._map.getZoom() + '-' + coords.x + '-' + coords.y + '.jpg';
                    }
                });

                L.tileLayer.zoomify = function (url, options) {
                    return new L.TileLayer.Zoomify(url, options);
                };

                L.tileLayer.zoomify = function (entityId, options) {
                    return new L.TileLayer.Zoomify(entityId, options);
                };
                var map = L.map(element[0]).setView([0, 0], 0);

                L.tileLayer.zoomify(attrs.entityid, {
                    width: scope.imageProperties.width,
                    height: scope.imageProperties.height,
                    tileSize: scope.imageProperties.tilesize,
                    tolerance: 0.8
                }).addTo(map);

            }
        };
    }]);

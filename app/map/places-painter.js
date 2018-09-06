'use strict';

angular.module('arachne.widgets.map')

/*
 * @author: David Neugebauer
 * @author: Daniel de Oliveira
 */
.factory('placesPainter', ['$compile', 'Place', '$rootScope', function ($compile, Place, $rootScope) {

    var markers = null; // used to keep track of markers for deleting them later
    var translocationLayerGroups = [];
    var map;
    var entityCallback;
    var fixedPlaces = []; // a set of fixed places given in the directive definition, which shall be shown independent of arachne-content
    var boundingBox = { // a bounding box of the fixed places
        latmin: 90,
        latmax: 0,
        lonmin: 180,
        lonmax: 0
	};

    var idaiCircleMarker = L.CircleMarker.extend({
        place: {},
        setPlace: function(place) {
            this.place = place;
            return this;
        }
    });

    // for clusters svg markers are not provided unfortunately
    var idaiClusterMarker = L.DivIcon.extend({
        options: {
            html: '',
            value: undefined,
            className: "cluster-marker",
            iconSize: [16, 16]
        },
        render: function(stats) {
            var color = angular.isUndefined(stats) ? 'rgb(0,255,0)' : calculateMarkerColor(this.options.value, stats.min, stats.max, stats.mean);
            this.options.html = '<div class="cluster-marker-inner" style="background-color:' + color + '">&nbsp;</div>';
            return this;
        }
    });

    function createPlaceMarker(place) {
        if (!place.hasCoordinates()) {
            console.warn("place not displayed due to missing coordinates:", place);
            return;
        }

        return new idaiCircleMarker(
            new L.LatLng(place.location.lat, place.location.lon),
            {
                radius: 6,
                fillOpacity: 1,
                opacity: 1,
                weight: 1,
                color: '#000000',
                className: 'circleMarker',
                fillColor: '#000000',
                riseOnHover: true
            }
        )
            .setPlace(place)
            .bindPopup('dummy'); //otherwise spiderfied markers have no popup first time they are clicked
    }

    function createMarkerPopup(place) {
        if (place.isFixed === true) {
            var title = (place.gazetteerId) ?
                '<strong><a href="https://gazetteer.dainst.org/app/#!/show/' + place.gazetteerId + '" target="_blank">' + place.name + '</a></strong>' :
                '<strong>' + place.name + '</strong>';
            var body = (place.text) ?
                '<p>' + place.text + '</p>' :
                '';
            return title + body;
        }

        var newScope = $rootScope.$new(true);
        newScope.place = place;
        newScope.entityCallback = entityCallback;
        var html = '<div con10t-map-popup place="place" entity-callback="entityCallback"></div>';
        return $compile(angular.element(html))(newScope)[0];
    }


    function getPlacesStats(places) {
        var stats = places.reduce(function(acc, cur) {
            return {
                max: Math.max(cur.entityCount, acc.max),
                min: Math.min(cur.entityCount, acc.min),
                sum: acc.sum + cur.entityCount
            }
        }, {
            min: 1,
            max: 1,
            sum: 0
        });
        stats.count = places.length;
        stats.mean = stats.sum / stats.count;

        return stats;
    }

    function calculateMarkerColor(value, min, max, mid) {
        mid = mid || ((max - min) / 2);

        function easing(pos) {
            return Math.sqrt(pos);
        }

        function calcValue(grd) {
            var pos1 = value <= mid ? grd[0] : grd[2];
            var pos2 = value <= mid ? grd[1] : grd[1];
            var pos = (value - (value <= mid ? min : mid)) / (value <= mid ? mid - min : (max-mid));
            pos = easing(value <= mid ? pos : 1 - pos);
            var len = Math.abs(pos1 - pos2);
            return parseInt((pos1 > pos2) ? pos1 - (len * pos) : pos1 + (len * pos));
        }

        function toHex(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        var gradient = [
            [0,   255, 255], //r
            [255, 255, 0  ], //g
            [0,   0,   0  ]  //b
        ];

        return '#' + gradient
            .map(calcValue)
            .map(toHex)
            .join("");
    }

    function createMarkerClusterGroup() {
        var options = {
            spiderfyDistanceMultiplier: 1.1,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false,
            spiderfyOnMaxZoom: true,
            cluserPane: "shadow-pane",
            spiderLegPolylineOptions: {
                weight: 2,
                color: '#000',
                opacity: 0.5
            },
            maxClusterRadius: 15,
            iconCreateFunction: function createClusterMarker(cluster) {
                return new idaiClusterMarker().render();
            }
        };

        return new L.MarkerClusterGroup(options);
    }

    function colorize(clusterLayer) {

        var topCluster = clusterLayer._topClusterLevel;
        var visibleClusters = [];
        var allClusters = [];

        function sum(a, b) {
            return a + b;
        }

        function countAllClustersEntitiesRecursive(cluster) {
            // don't get fooled by cluster._childClusters.length
            var childCount = cluster._childClusters
                    .map(countAllClustersEntitiesRecursive)
                    .reduce(sum, 0)
                + cluster._markers
                    .map(function(marker) {
                        return marker.place.entityCount
                    })
                    .reduce(sum, 0);


            var clusterAndCount = {
                cluster: cluster,
                entityCount: childCount
            };
            allClusters.push(clusterAndCount);

            if (map.getZoom() === cluster._zoom) {
                visibleClusters.push(clusterAndCount);
            }


            return childCount;
        }

        countAllClustersEntitiesRecursive(topCluster);

        var placesStats = getPlacesStats(visibleClusters);

        // we do not only paint visible clusters but all, because
        // zooming looks very bad otherwise, since the clusters seems to become green until the new data arrives.
        // this could be avoided if markers would get removed right after zoomend and not stay until new data
        // arrived. or a way faster backend.
        visibleClusters.forEach(function(entry) {
            entry.cluster.setIcon(new idaiClusterMarker({value: entry.entityCount}).render(placesStats));
        });

        topCluster.getAllChildMarkers().forEach(function(marker) {
            var color = calculateMarkerColor(marker.place.entityCount, placesStats.min, placesStats.max, placesStats.mean);

            marker.setStyle({
                fillColor: color
            })
        });
    }


    return {

        setMap: function(mp) {
          map = mp;
        },

        setEntityCallback: function(ec) {
            entityCallback = ec;
        },

        clear: function() {
            if (markers) {
                map.removeLayer(markers);
            }
            markers = null;
            this.clearTranslocationLines();
        },

        setFixedPlaces: function placesPainter_setFixedPlaces(places) {
            if (typeof places !== "object") {
                return;
            }

            angular.forEach(places, function(p) {

               var place = new Place();
               place.location = p.location;
               place.name = p.name;
               place.entityCount = 0;
               place.gazetteerId = p.gazetteerId;
               place.text = p.text;
               place.isFixed = true;

               boundingBox.latmin = Math.min(place.location.lat, boundingBox.latmin);
               boundingBox.latmax = Math.max(place.location.lat, boundingBox.latmax);
               boundingBox.lonmin = Math.min(place.location.lon, boundingBox.lonmin);
               boundingBox.lonmax = Math.max(place.location.lon, boundingBox.lonmax);

               fixedPlaces.push(place);
            });
        },

        getFixedPlacesBoundingBox: function placesPainter_getFixedPlaces() {
            return (fixedPlaces.length) ? boundingBox : false;
        },

        drawPlaces: function(places, scope) {

            if (!places) return;

            var mergedPlaces = fixedPlaces.concat(places);

            markers = createMarkerClusterGroup().addTo(map);

            for (var i = 0; i < mergedPlaces.length; i++) {
                createPlaceMarker(mergedPlaces[i]).addTo(markers);
            }

            markers
                .on('click', function(clickEvent) {
                    var marker = clickEvent.layer;
                    var popup = createMarkerPopup(marker.place);
                    marker.bindPopup(popup, {
                        minWidth: 150
                    });
                    marker.openPopup();
                })
                .on('clusterclick', function(clickEvent) {
                    clickEvent.layer.spiderfy();
                })
                .bringToFront();

            colorize(markers);
        },

        clearTranslocationLines: function() {
            translocationLayerGroups.forEach(function(layer) {
                map.removeLayer(layer);
            });
            translocationLayerGroups = [];
        },

        drawTranslocationLines: function(places) {
            translocationLayerGroups.push(this.generateTranslocationLines(places).addTo(map));
        },

        generateTranslocationLines: function(places) {

            var translocationLayerGroup = new L.layerGroup();

            // Remove places without location value, without dates and places which have the same
            // consecutive locations
            for (var i = 0; i < places.length; i++) {
                if ((typeof places[i].location === 'undefined') ||
                    (
                        i+1 < places.length &&
                        JSON.stringify(places[i].location) === JSON.stringify(places[i+1].location)
                    )
                ) {
                    places.splice(i, 1);
                    i--; // need to decrease the loop counter because the list just got smaller and
                         // the next object has the same index as this one
                }
            }

            if (places && places.length > 1) {

                for (var i = 0; i < places.length-1; i++) {

                    var latlngs = [
                        [places[i].location.lat, places[i].location.lon, i],
                        [places[i+1].location.lat, places[i+1].location.lon, i+1]
                    ];

                    var options = {
                        weight: 1,
                        delay: 600
                    };

                    L.polyline.antPath(latlngs, options).addTo(translocationLayerGroup);

                }

            }

            return translocationLayerGroup;
        }
    }
}]);

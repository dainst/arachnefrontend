/**
 * @author: Jan G. Wieners
 */

'use strict';

angular.module('arachne.widgets.map')
    .directive('arEntityMap', ['$compile', 'Entity', 'Query', function($compile, Entity, Query) {
            return {
                restrict: 'A',
                scope: {
                    places: "="
                },
                link: function (scope, element, attrs) {

                    var map = L.map('entityMap').setView([40, -10], 3);

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

                    var layer = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=b47a3cf895b94aedad41e5cfb5222b87', {
                        maxZoom: 18,
                        minZoom: 2
                    });

                    map.addLayer(layer);
                    map.trackResize = true;
                    L.Icon.Default.imagePath = 'img';

                    var oms = new OverlappingMarkerSpiderfier(map, {keepSpiderfied: true });
                    oms.addListener('spiderfy', function(markers) {
                        map.closePopup();
                    });

                    var markers = [];

                    var loadMarkers = function () {

                        if (scope.places) {

                            for (var index in scope.places) {

                                var place = scope.places[index];

                                place.query = new Query();
                                place.query.q = "places.gazetteerId:"+place.gazetteerId;

                                if (!place.location) {
                                    continue;
                                }

                                var name = place.name,
                                    relation = place.relation,
                                    location = place.location,
                                    text = place.name;

                                var newScope = scope.$new(true);
                                var linkFunction = null;

                                newScope.place = place;

                                if (place.isFixed === true) {
                                    linkFunction = function(innerScope) {
                                        var title = (innerScope.place.gazetteerId) ?
                                            '<strong><a href="https://gazetteer.dainst.org/app/#!/show/' + innerScope.place.gazetteerId + '" target="_blank">' + innerScope.place.name + '</a></strong>' :
                                            '<strong>' + innerScope.place.name + '</strong>';
                                        var body = (innerScope.place.text) ?
                                            '<p>' + innerScope.place.text + '</p>' :
                                            '';
                                        return [title + body];
                                    }
                                } else {
                                    var html = '<div ar-map-marker-popup place="place" short-form="true"></div>';
                                    linkFunction = $compile(angular.element(html));
                                }

                                var icon = 'record';

                                if (place.relation) {
                                    if (place.relation.indexOf("Aufbewahrung") != -1) icon = 'home';
                                    else if (place.relation == "Fundort") icon = "eye-open";
                                }
                                var awesomeMarker = L.AwesomeMarkers.icon({
                                    icon: icon,
                                    markerColor: 'cadetblue'
                                });

                                var newMarker = L.marker(new L.LatLng(location.lat, location.lon),
                                    {title: text, icon: awesomeMarker}
                                );

                                newMarker.on('click', function(newScope,linkFunction) {
                                    var popup;
                                    return function(e) {
                                        if (!popup) popup = linkFunction(newScope)[0];
                                        if (e.target.getPopup()) e.target.unbindPopup();
                                        e.target.bindPopup(popup,{ minWidth: 150, autoPan: false });
                                        e.target.openPopup();
                                    };
                                }(newScope,linkFunction));


                                markers.push(newMarker);
                                map.addLayer(newMarker);
                                oms.addMarker(newMarker);
                            }

                        }
                        var mark = L.featureGroup(markers);

                        // workaround, see https://github.com/Leaflet/Leaflet/issues/2021
                        map.whenReady(function () {
                            window.setTimeout(function () {
                                if (markers.length > 1) map.fitBounds(mark.getBounds(), {padding: [20, 20]});
                                else {

                                    var bounds = mark.getBounds();

                                    map.setZoom(5);

                                    // Ensure that marker stays in focus until map has been dragged
                                    map.setMaxBounds(bounds);

                                    map.on('drag', function() {
                                        map.setMaxBounds(null);
                                    });
                                }
                            }.bind(this), 200);
                        }, this);

                        map._onResize();
                    };

                    var loadDirectionalArrows = function () {

                        scope.places.sort(function(a, b) {
                            var nameA = a.storageFromYear; // ignore upper and lowercase
                            var nameB = b.storageToYear; // ignore upper and lowercase

                            if (nameA == nameB) {
                                return 0;
                            } else {
                                return nameA > nameB ? 1 : -1
                            }
                        });

                        if (scope.places && scope.places.length > 1) {
                            for (var i in scope.places) {
                                var nextIndex = parseInt(i) + 1;

                                // stop when last but one array element is reached
                                if (nextIndex == scope.places.length) {
                                    continue;
                                }

                                var place1 = scope.places[i];
                                var place2 = scope.places[nextIndex];

                                if (typeof place1.location == 'undefined' || typeof place2.location == 'undefined') {
                                    // console.log('undefined location...skipping: ' + place1.name + ' <-> ' + place2.name);
                                    continue;
                                }

                                // crashing when the locations are the same
                                // -> JSON stringify to be able to compare the objects
                                if (JSON.stringify(place1.location) == JSON.stringify(place2.location)) {
                                    // console.log('same location...skipping: ' + place1.name + ' <-> ' + place2.name);
                                    continue;
                                }

                                var latlngs2 = [
                                    [place2.location.lat, place2.location.lon],
                                    [place1.location.lat, place1.location.lon]
                                ];

                                var polyline = L.polyline(latlngs2, {color: 'red'}).addTo(map);

                                // zoom the map to the polyline
                                map.fitBounds(polyline.getBounds());

                                var decorator = L.polylineDecorator(polyline, {
                                    patterns: [{
                                        offset: '100%',
                                        // repeat: 10,
                                        repeat: 0,
                                        symbol: L.Symbol.arrowHead({
                                            pixelSize: 30,
                                            headAngle: 80,
                                            pathOptions: {
                                                color: 'red'
                                            }
                                        })
                                    }]
                                });
                                decorator.addTo(map);
                            }
                        }
                    }

                    loadMarkers();
                    loadDirectionalArrows();
                }
            };
        }]);

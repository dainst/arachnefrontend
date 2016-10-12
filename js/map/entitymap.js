'use strict';

angular.module('arachne.widgets.map')

/**
 * @author: Jan G. Wieners
 */
    .directive('entitymap', [function() {
            return {
                restrict: 'A',
                scope: {
                    places: "="
                },
                link: function (scope, element, attrs) {

                    var map = L.map('entitymap').setView([40, -10], 3);

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

                    var layer = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
                        maxZoom: 18,
                        minZoom: 2
                    });

                    map.addLayer(layer);
                    map.trackResize = true;
                    L.Icon.Default.imagePath = 'img';

                    var markers = [];

                    var loadMarkers = function () {

                        if (scope.places) {

                            for (var place in scope.places) {

                                var curplace = scope.places[place];

                                if (!curplace.location) {
                                    continue;
                                }

                                var name = curplace.name,
                                    relation = curplace.relation,
                                    location = curplace.location,
                                    title = "";

                                if (relation) title += "<b>" + relation + "</b><br/>";
                                title += "<a href='http://gazetteer.dainst.org/place/" + curplace.gazetteerId
                                    + "' target='_blank'>" + name + "</a>";

                                var text = name,
                                    icon = 'record';

                                if (curplace.relation) {
                                    if (curplace.relation.indexOf("Aufbewahrung") != -1) icon = 'home';
                                    else if (curplace.relation == "Fundort") icon = "eye-open";
                                }
                                var awesomeMarker = L.AwesomeMarkers.icon({
                                    icon: icon,
                                    markerColor: 'cadetblue'
                                });

                                var newMarker = L.marker(new L.LatLng(location.lat, location.lon), {title: text, icon: awesomeMarker});
                                newMarker.bindPopup(title);
                                markers.push(newMarker);
                                map.addLayer(newMarker);
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
                    loadMarkers();
                }
            };
        }]);

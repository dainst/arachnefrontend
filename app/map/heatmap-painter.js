'use strict';

angular.module('arachne.widgets.map')

/**
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 */
.factory('heatmapPainter', function () {

    var map;
    var heatLayer;

    /**
     * calculates a CSS color value for a given value from blue to red
     * @param value between 0 and 1
     */
    function heatMapColorForValue(value) {
        var h = Math.round((1.0 - value) * 240);
        return "hsl(" + h + ", 90%, 50%)";
    }

    /**
     * Generates a gradient object as expected by leaflet.heat's options
     * @param e exponent used for calculating the gradient points
     *    can be used to make the gradient denser at lower values and account
     *    for a long tail in the geographic distribution of entities
     */
    function generateGradient(e) {
        var gradient = {};
        for (var i = 1; i <= 10; i++) {
            gradient[Math.pow(i / 10, e)] = heatMapColorForValue(i / 10);
        }
        return gradient;
    }

    var heatPoints = function(boxesToDraw) {

        var heatPoints=[];
        for (var i = 0; i < boxesToDraw.length; i++) {
            var coords = angular.fromJson(boxesToDraw[i].value);
            coords.push(boxesToDraw[i].count);
            heatPoints.push(coords);
        }
        return heatPoints;
    };

    return {
        setMap: function(mp) {
            map = mp;
        },
        drawBuckets: function (bbox,bucketsToDraw) {
            if (!bucketsToDraw) return;

            var max = bucketsToDraw[0].count;
            heatLayer = L.heatLayer(heatPoints(bucketsToDraw), {
                radius: 10,
                max: max,
                gradient: generateGradient(3),
                maxZoom: 0,
                minOpacity: 0.3
            }).addTo(map);
        },
        clear: function() {
            if (heatLayer) map.removeLayer(heatLayer);
        }
    }
});

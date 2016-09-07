'use strict';

angular.module('arachne.widgets.map')

/**
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 */
.factory('heatmapPainter', function () {

    var map;
    var heatLayer;

    function heatMapColorForValue(value) {
        var h = Math.round((1.0 - value) * 240);
        return "hsl(" + h + ", 90%, 50%)";
    }

    function generateGradient(s) {
        var gradient = {};
        for (var i = 1; i <= 10; i++) {
            gradient[s * i / 10] = heatMapColorForValue(i / 10);
        }
        return gradient;
    }

    function max(boxesToDraw) {
        var max=0;
        for (var i = 0; i < boxesToDraw.length; i++) {
            if ((boxesToDraw[i].count)>max) max=boxesToDraw[i].count;
        }
        return max;
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
            map=mp;
        },
        drawBuckets: function (bbox,bucketsToDraw) {
            if (!bucketsToDraw) return;

            heatLayer = L.heatLayer(heatPoints(bucketsToDraw), {
                radius: 10,
                max: max(bucketsToDraw),
                gradient: generateGradient(0.7),
                minOpacity: 0.3
            }).addTo(map);
        },
        clear: function() {
            if (heatLayer) map.removeLayer(heatLayer);
        }
    }
});

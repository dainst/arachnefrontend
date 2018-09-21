'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tNetwork', ['$http', '$q', function ($http, $q) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-network.html',
            scope: {
                placesDataPath: '@',
                objectDataPath: '@',
                lat: '@',
                lng: '@',
                zoom: '@'
            },
            link: function (scope, element, attrs) {

                scope.minDate = new Date(-8640000000000000);
                scope.maxDate = new Date(8640000000000000);

                scope.masterNames = [
                    "Braun, Emil",
                    "Brunn, Heinrich von",
                    "Bunsen, Christian Karl Josias von",
                    "Gerhard, Eduard",
                    "Henzen, Wilhelm",
                    "Jahn, Otto",
                    "Lepsius, Carl Richard",
                    "Michaelis, Adolf",
                    "Mommsen, Theodor",
                    "Unbekannt"
                ];

                scope.masterColors = [
                    "#89b7e5",
                    "#6699cc",
                    "#5b89e5",
                    "#3399cc",
                    "#336699",
                    "#75A3D1",
                    "#668899",
                    "#255177",
                    "#0066cc",
                    "#003366"
                ];

                scope.masterMatrix = [
                    // Autoren:
                    // Braun, Brunn, Bunsen, Gerhard, Henzen,  Jahn, Lepsius, Michaelis, Mommsen, Unbekannt
                    // (692),  (56),   (61),  (1479), (1457), (299),   (128),       (0),     (1),      (51)
                    //                                                                                       Rezipienten:
                    [      0,     0,      0,     538,     31,    10,      31,         0,       0,        0], // Braun (610)
                    [      8,     0,      0,      82,    254,     5,       0,         0,       1,        1], // Brunn (351)
                    [    100,     2,      0,      67,     10,     0,      23,         0,       0,       21], // Bunsen (223)
                    [    461,     2,     59,       0,    578,    14,      33,         0,       0,        6], // Gerhard (1153)
                    [     30,    52,      0,     661,      2,     5,      41,         0,       0,        6], // Henzen (797)
                    [      0,     0,      0,       0,      0,     0,       0,         0,       0,        0], // Jahn (0)
                    [     92,     0,      2,      48,    245,     0,       0,         0,       0,        5], // Lepsius (392)
                    [      0,     0,      0,      62,      0,   252,       0,         0,       0,        0], // Michaelis (314)
                    [      1,     0,      0,       0,    337,     1,       0,         0,       0,       12], // Mommsen (351)
                    [      0,     0,      0,      21,      0,    12,       0,         0,       0,        0]  // Unbekannt (33)
                ];
            }
        }
    }]);

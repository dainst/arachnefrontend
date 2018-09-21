'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tNetwork', ['$http', '$q', '$filter', function ($http, $q, $filter) {
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
                scope.initializeChordParameters = function () {
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
                        [0, 0, 0, 538, 31, 10, 31, 0, 0, 0], // Braun (610)
                        [8, 0, 0, 82, 254, 5, 0, 0, 1, 1], // Brunn (351)
                        [100, 2, 0, 67, 10, 0, 23, 0, 0, 21], // Bunsen (223)
                        [461, 2, 59, 0, 578, 14, 33, 0, 0, 6], // Gerhard (1153)
                        [30, 52, 0, 661, 2, 5, 41, 0, 0, 6], // Henzen (797)
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Jahn (0)
                        [92, 0, 2, 48, 245, 0, 0, 0, 0, 5], // Lepsius (392)
                        [0, 0, 0, 62, 0, 252, 0, 0, 0, 0], // Michaelis (314)
                        [1, 0, 0, 0, 337, 1, 0, 0, 0, 12], // Mommsen (351)
                        [0, 0, 0, 21, 0, 12, 0, 0, 0, 0]  // Unbekannt (33)
                    ];
                };
                scope.initializeTimeLineParameters = function () {
                    var objectDataColumns = ['id', 'timespanFrom', 'timespanTo'];
                    var dataQueries = [];
                    dataQueries.push($http.get(scope.objectDataPath));

                    $q.all(dataQueries)
                        .then(function (responses) {
                            scope.objectData = scope.processTsvData(
                                $filter('tsvData')(responses[0].data, objectDataColumns)
                            );
                        });

                    scope.processTsvData = function (tsvData) {
                        scope.timeDataBins = [];
                        scope.binnedData = {};

                        for (var i = 0; i < tsvData.length; i++) {
                            var currentObject = tsvData[i];

                            var fromDate = new Date(currentObject['timespanFrom']);
                            var toDate = new Date(currentObject['timespanTo']);

                            if (fromDate.toString() === 'Invalid Date' || toDate.toString() === 'Invalid Date') {
                                continue;
                            }

                            if (fromDate.toISOString() === toDate.toISOString()) {
                                var binKey = fromDate.toISOString().substr(0, 4);

                                if (binKey in scope.binnedData) {
                                    scope.binnedData[binKey] += 1
                                } else {
                                    scope.binnedData[binKey] = 1
                                }
                            } else {
                                var fromBinKey = fromDate.toISOString().substr(0, 4);
                                var toBinKey = toDate.toISOString().substr(0, 4);

                                if (fromBinKey in scope.binnedData) {
                                    scope.binnedData[fromBinKey] += 1
                                } else {
                                    scope.binnedData[fromBinKey] = 1
                                }

                                if (toBinKey in scope.binnedData) {
                                    scope.binnedData[toBinKey] += 1
                                } else {
                                    scope.binnedData[toBinKey] = 1
                                }
                            }
                        }

                        for (var binKey in scope.binnedData) {
                            scope.timeDataBins.push({
                                'date': new Date(binKey),
                                'count': scope.binnedData[binKey]
                            });
                        }

                        scope.timeDataBins.sort(function (a, b) {
                            return a.date - b.date;
                        });

                        var getYearsInbetween = function (startYear, endYear) {
                            var result = [];
                            var currentYear = startYear + 1;

                            while (currentYear < endYear) {
                                result.push(
                                    {
                                        'date': new Date(currentYear, 1, 1),
                                        'count': 0
                                    });
                                currentYear += 1;
                            }

                            return result;
                        };

                        // Fill up missing year bins (= years with 0 objects)
                        for(var i = 0; i < scope.timeDataBins.length - 1; i++) {

                            if(scope.timeDataBins[i]['date'].getFullYear() + 1
                                !== scope.timeDataBins[i + 1]['date'].getFullYear()){
                                var inbetween = getYearsInbetween(
                                    scope.timeDataBins[i]['date'].getFullYear(),
                                    scope.timeDataBins[i + 1]['date'].getFullYear()
                                );

                                for(var j = 0; j < inbetween.length; j++){
                                    scope.timeDataBins.splice(i + 1 + j, 0, inbetween[j])
                                }
                            }
                        }
                    };

                };

                scope.initializeChordParameters();
                scope.initializeTimeLineParameters();

                console.log(scope.minDate, scope.maxDate)
            }
        }
    }]);

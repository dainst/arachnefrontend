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

                scope.$watch('minDate', function(newValue, oldValue) {
                    scope.evaluateState();
                });

                scope.$watch('maxDate', function(newValue, oldValue) {
                    scope.evaluateState()
                });

                scope.$watch('selectedPlaceId', function(newValue, oldValue){
                   scope.evaluateState();
                });

                scope.selectedPlaceId = null;


                scope.evaluateOverallDateRange = function(){
                    scope.overallMinDate = new Date(8640000000000000);
                    scope.overallMaxDate = new Date(-8640000000000000);

                    for(var i = 0; i < scope.objectData.length; i++){
                        var current = scope.objectData[i];

                        if(new Date(current['timespanFrom']) < scope.overallMinDate){
                            scope.overallMinDate = new Date(current['timespanFrom'])
                        }

                        if(new Date(current['timespanTo']) > scope.overallMaxDate) {
                            scope.overallMaxDate = new Date(current['timespanTo'])
                        }
                    }

                    scope.minDate = scope.overallMinDate;
                    scope.maxDate = scope.overallMaxDate;
                };

                // Takes data and creates a lookup-index based on the values behind the given key
                scope.createIndex = function (data, indexKey){
                    var index = {};

                    var i = 0;
                    while(i < data.length) {
                        index[data[i][indexKey]] = i;
                        i += 1;
                    }

                    return index;
                };

                scope.createTimeLineBins = function(){
                    scope.timeDataBins = [];
                    scope.binnedData = {};

                    for (var i = 0; i < scope.objectData.length; i++) {
                        var currentObject = scope.objectData[i];

                        var fromDate = new Date(currentObject['timespanFrom']);
                        var toDate = new Date(currentObject['timespanTo']);
                        if (isNaN(fromDate.getDate()) || isNaN(toDate.getDate())) {
                            continue;
                        }

                        var originPlace = scope.placeData[
                            scope.placeIndexById[currentObject['originPlaceId']]
                            ];

                        var destinationPlace = scope.placeData[
                            scope.placeIndexById[currentObject['destinationPlaceId']]
                            ];
                        var inactiveObjectDueToPlace = true;
                        if(scope.selectedPlaceId == null)
                            inactiveObjectDueToPlace = false;
                        if(scope.selectedPlaceId === originPlace['id'])
                            inactiveObjectDueToPlace = false;
                        if(scope.selectedPlaceId === destinationPlace['id'])
                            inactiveObjectDueToPlace = false;

                        if(inactiveObjectDueToPlace)
                            continue;

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
                                    'date': new Date(currentYear.toString()),
                                    'count': 0
                                });
                            currentYear += 1;
                        }

                        return result;
                    };

                    // Fill up missing year bins (= years with 0 objects)
                    var inbetween = getYearsInbetween(
                        scope.overallMinDate.getFullYear() - 1,
                        scope.timeDataBins[0]['date'].getFullYear()
                    );

                    scope.timeDataBins = inbetween.concat(scope.timeDataBins);

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

                    var inbetween = getYearsInbetween(
                        scope.timeDataBins[scope.timeDataBins.length - 1]['date'].getFullYear(),
                        scope.overallMaxDate.getFullYear() + 1
                    );
                    scope.timeDataBins = scope.timeDataBins.concat(inbetween);
                };

                scope.evaluateState = function(){
                    if(typeof scope.placeData === 'undefined' || typeof scope.objectData === 'undefined'){
                        return;
                    }
                    scope.createTimeLineBins();
                    scope.evaluateVisiblePlaces();
                    //console.log('Evaluating connections.');
                    //scope.evaluateVisibleConnections();

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.evaluateVisiblePlaces = function() {
                    scope.visiblePlaces = [];
                    scope.visibleConnections = [];

                    for(var i = 0; i < scope.objectData.length; i++) {
                        var currentObject = scope.objectData[i];
                        if ((isNaN(Date.parse(currentObject['timespanFrom']))
                            || Date.parse(currentObject['timespanFrom']) < scope.minDate
                        ) || (
                            isNaN(Date.parse(currentObject['timespanTo']))
                            || Date.parse(currentObject['timespanTo']) > scope.maxDate
                        )) continue;

                        var alreadyAdded = function (newPlace) {
                            return scope.visiblePlaces.some(function(place){
                                return place['id'] === newPlace['id'];
                            })
                        };

                        var originPlace = scope.placeData[
                            scope.placeIndexById[currentObject['originPlaceId']]
                            ];

                        if(!alreadyAdded(originPlace)) {
                            scope.visiblePlaces.push(originPlace);
                        }

                        var destinationPlace = scope.placeData[
                            scope.placeIndexById[currentObject['destinationPlaceId']]
                            ];

                        if(!alreadyAdded(destinationPlace)) {
                            scope.visiblePlaces.push(destinationPlace);
                        }

                        scope.visibleConnections.push([
                            currentObject['originPlaceId'], currentObject['destinationPlaceId']
                        ]);
                    }
                };



                scope.loadData = function() {
                    var objectDataColumns = ['id', 'timespanFrom', 'timespanTo', 'originPlaceId',
                        'destinationPlaceId'];
                    var placesDataColumns = [ 'id', 'lat', 'lng', 'name', 'authId', 'authSource' ];

                    var dataQueries = [];
                    dataQueries.push($http.get(scope.objectDataPath));
                    dataQueries.push($http.get(scope.placesDataPath));

                    // TODO: Generate based on TSV data
                    scope.names = [
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

                    scope.colors = [
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

                    scope.matrix = [
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

                    $q.all(dataQueries)
                        .then(function (responses) {
                            scope.objectData = $filter('tsvData')(responses[0].data, objectDataColumns);
                            scope.placeData = $filter('tsvData')(responses[1].data, placesDataColumns);

                            scope.placeIndexById = scope.createIndex(scope.placeData, 'id');
                            scope.objectIndexById = scope.createIndex(scope.objectData, 'id');

                            scope.evaluateOverallDateRange();
                            scope.createTimeLineBins();
                            scope.evaluateState();
                        });
                };

                scope.loadData();
            }
        }
    }]);

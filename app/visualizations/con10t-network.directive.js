'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tNetwork', ['$http', '$q', '$filter', '$location', function ($http, $q, $filter, $location) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-network.html',
            scope: {
                placeDataPath: '@',
                objectDataPath: '@',
                personDataPath: '@',
                lat: '@',
                lng: '@',
                zoom: '@',
                objectNameSingular: '@',
                objectNamePlural: '@'
            },
            link: function (scope, element, attrs) {
                scope.evaluateOverallDateRange = function(){
                    scope.overallMinDate = new Date(8640000000000000);
                    scope.overallMaxDate = new Date(-8640000000000000);

                    for(var i = 0; i < scope.rawObjectData.length; i++){
                        var current = scope.rawObjectData[i];

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

                scope.createTimeLineBins = function(){
                    scope.timeDataBins = [];
                    scope.binnedData = {};

                    for (var i = 0; i < scope.rawObjectData.length; i++) {
                        if(scope.isObjectIgnoredDueToSelectedPlace(scope.rawObjectData[i])) continue;

                        var currentObject = scope.rawObjectData[i];

                        var fromDate = new Date(currentObject['timespanFrom']);
                        var toDate = new Date(currentObject['timespanTo']);
                        if (isNaN(fromDate.getDate()) || isNaN(toDate.getDate())) {
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


                scope.evaluateActiveArachneIDs = function() {
                    scope.arachneIds = [];

                    for(var i = 0; i < scope.rawObjectData.length; i++) {
                        if(!scope.isObjectWithinSelectedTimeSpan(scope.rawObjectData[i])) continue;
                        if(scope.isObjectIgnoredDueToSelectedPlace(scope.rawObjectData[i])) continue;

                        if(scope.rawObjectData[i]['arachneId'] !== 'null') {
                            scope.arachneIds.push(scope.rawObjectData[i]['arachneId']);
                        }
                    }
                };

                scope.evaluateVisiblePlaces = function() {
                    scope.visiblePlaces = [];
                    scope.visibleConnections = [];

                    for(var i = 0; i < scope.rawObjectData.length; i++) {
                        if(!scope.isObjectWithinSelectedTimeSpan(scope.rawObjectData[i])) continue;

                        var currentObject = scope.rawObjectData[i];

                        var alreadyAdded = function (newPlace) {
                            return scope.visiblePlaces.some(function(place){
                                return place['id'] === newPlace['id'];
                            })
                        };

                        if(currentObject['originPlaceId'] !== 'null'){
                            var originPlace = scope.rawPlaceData[
                                scope.placeIndexById[currentObject['originPlaceId']]
                                ];

                            if(!alreadyAdded(originPlace)) {
                                scope.visiblePlaces.push(originPlace);
                            }
                        }

                        if(currentObject['destinationPlaceId'] !== 'null'){
                            var destinationPlace = scope.rawPlaceData[
                                scope.placeIndexById[currentObject['destinationPlaceId']]
                                ];

                            if(!alreadyAdded(destinationPlace)) {
                                scope.visiblePlaces.push(destinationPlace);
                            }
                        }

                        if(currentObject['originPlaceId'] !== 'null' && typeof originPlace !== 'undefined' &&
                            currentObject['destinationPlaceId'] !== 'null' && typeof destinationPlace !== 'undefined'){
                            scope.visibleConnections.push([
                                currentObject['originPlaceId'], currentObject['destinationPlaceId']
                            ]);
                        }
                    }
                };

                scope.evaluateTopPersonConnections = function(){

                    var combineKey = function (authorId, recipientId) {
                        return authorId + ':::' + recipientId;
                    };
                    var splitKey = function (key) {
                        return key.split(':::')
                    };

                    var generateMatrix = function(rows, values) {
                        var result = [];

                        for(var row = 0; row < rows.length; row++){
                            result[row] = [];
                            for(var column = 0; column < rows.length; column++){
                                result[row][column] = 0;
                            }

                            for(var idx = 0; idx < values.length; idx++){
                                if(values[idx][0] === rows[row]){
                                    result[row][rows.indexOf(values[idx][1])] = values[idx][2]
                                }
                            }
                        }
                        return result;
                    };

                    var personConnections = {};
                    for(var i = 0; i < scope.rawObjectData.length; i++) {
                        if(!scope.isObjectWithinSelectedTimeSpan(scope.rawObjectData[i])) continue;
                        if(scope.isObjectIgnoredDueToSelectedPlace(scope.rawObjectData[i])) continue;

                        var currentKey = combineKey(
                            scope.rawObjectData[i]['authorId'],
                            scope.rawObjectData[i]['recipientId']
                        );

                        if(currentKey in personConnections) {
                            personConnections[currentKey] += 1
                        } else{
                            personConnections[currentKey] = 1
                        }
                    }

                    var personConnectionsSorted = [];
                    for(var key in personConnections){
                        var split = splitKey(key);
                        var authorId = split[0];
                        var recipientId = split[1];

                        personConnectionsSorted.push([authorId, recipientId, personConnections[key]]);
                    }
                    personConnectionsSorted = personConnectionsSorted.sort(function(x, y) {
                        return y[2] - x[2];
                    }).slice(0, 10);

                    var tempConnections = personConnectionsSorted.slice(0, 10);

                    var topPersonsIds = [];
                    for(var idx in tempConnections){
                        var authorId = tempConnections[idx][0];
                        var recipientId = tempConnections[idx][1];

                        if(topPersonsIds.indexOf(authorId) < 0) {
                            topPersonsIds.push(authorId);
                        }

                        if(topPersonsIds.indexOf(recipientId) < 0){
                            topPersonsIds.push(recipientId);
                        }
                    }

                    var stack1 = [];
                    var stack2 = [];
                    for(var idx in topPersonsIds){
                        if(idx % 2 === 0){
                            stack1.push(topPersonsIds[idx]);
                        } else {
                            stack2.push(topPersonsIds[idx]);
                        }
                    }

                    topPersonsIds = stack1.concat(stack2);

                    var topConnections = [];
                    for(var idx in personConnectionsSorted) {
                        var currentConnection = personConnectionsSorted[idx];
                        if(
                            topPersonsIds.indexOf(currentConnection[0]) >= 0 &&
                            topPersonsIds.indexOf(currentConnection[1]) >= 0
                        ){
                            topConnections.push(currentConnection);
                        }
                    }

                    scope.matrix = generateMatrix(topPersonsIds, topConnections);
                    scope.names = [];

                    for(var i = 0; i < topPersonsIds.length; i++){
                        scope.names.push(scope.rawPersonData[scope.personIndexById[topPersonsIds[i]]]['name'])
                    }
                };

                scope.evaluateState = function(){
                    if(typeof scope.rawPlaceData === 'undefined' || typeof scope.rawObjectData === 'undefined'){
                        return;
                    }
                    scope.evaluateActiveArachneIDs();
                    scope.createTimeLineBins();
                    scope.evaluateVisiblePlaces();
                    scope.evaluateTopPersonConnections();

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.isObjectWithinSelectedTimeSpan = function(objectData){
                    if(isNaN(Date.parse(objectData['timespanFrom']))
                        || Date.parse(objectData['timespanFrom']) < scope.minDate
                    ) return false;

                    if(isNaN(Date.parse(objectData['timespanTo']))
                        || Date.parse(objectData['timespanTo']) > scope.maxDate
                    ) return false;

                    return true;
                };

                scope.isObjectIgnoredDueToSelectedPlace = function(objectData){
                    var isIgnored = true;
                    if(scope.selectedPlaceId == null)
                        isIgnored = false;
                    if(objectData['originPlaceId'] !== 'null'
                        && scope.selectedPlaceId === objectData['originPlaceId']) {
                        isIgnored = false;
                    }
                    if(objectData['destinationPlaceId'] !== 'null'
                        && scope.selectedPlaceId === objectData['destinationPlaceId']){
                        isIgnored = false;
                    }
                    return isIgnored;
                };

                // Creates a lookup-index for a list of data objects based on the given key
                scope.createIndex = function (data, indexKey){
                    var index = {};

                    var i = 0;
                    while(i < data.length) {
                        index[data[i][indexKey]] = i;
                        i += 1;
                    }

                    return index;
                };

                scope.loadData = function() {
                    var objectDataColumns = ['id', 'arachneId', 'timespanFrom', 'timespanTo', 'originPlaceId',
                        'destinationPlaceId', 'authorId', 'recipientId'];
                    var placesDataColumns = [ 'id', 'lat', 'lng', 'name', 'authId', 'authSource' ];
                    var personDataColumns = [ 'id', 'authId', 'authSource', 'name'];

                    var dataQueries = [];
                    dataQueries.push($http.get(scope.objectDataPath));
                    dataQueries.push($http.get(scope.placeDataPath));
                    dataQueries.push($http.get(scope.personDataPath));

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

                    $q.all(dataQueries)
                        .then(function (responses) {
                            scope.rawObjectData = $filter('tsvData')(responses[0].data, objectDataColumns);
                            scope.rawPlaceData = $filter('tsvData')(responses[1].data, placesDataColumns);
                            scope.rawPersonData = $filter('tsvData')(responses[2].data, personDataColumns);

                            scope.placeIndexById = scope.createIndex(scope.rawPlaceData, 'id');
                            scope.objectIndexById = scope.createIndex(scope.rawObjectData, 'id');
                            scope.personIndexById = scope.createIndex(scope.rawPersonData, 'id');

                            scope.evaluateOverallDateRange();
                            scope.evaluateState();
                        });
                };

                scope.searchArachneIds = function() {

                    if(scope.arachneIds.length === 0) return;

                    var path = 'search?q=entityId:' + scope.arachneIds[0];
                    for(var i = 1; i < scope.arachneIds.length; i++) {
                        path += ' OR entityId:' + scope.arachneIds[i]
                    }

                    $location.url(path)
                };

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
                scope.arachneIds = [];
                scope.loadData();
            }
        }
    }]);

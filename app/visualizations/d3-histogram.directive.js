'use strict';


angular.module('arachne.visualizations.directives')
    .directive('con10tHistogram', ['$http', '$q', function ($http, $q) {
        return {
            restrict: 'E',
            scope: {
                letterDataPath: '@'
            },
            link: function (scope, element, attrs) {
                var dataQueries = [];

                dataQueries.push($http.get(scope.letterDataPath));

                $q.all(dataQueries)
                    .then(function(responses) {
                        scope.letterData = scope.parseTsvData(responses[0].data);
                        scope.initialize();
                        scope.updateState();
                    });

                scope.parseTsvData = function(data){
                    var parsedRows = [];
                    var lines = data.split('\n');

                    var headings = lines[0].split('\t');

                    var line_index = 1;
                    while (line_index < lines.length && lines[line_index].trim() !== '') {
                        var parsedLine = {};
                        var values = lines[line_index].split('\t');

                        var columnIndex = 0;

                        while (columnIndex < headings.length) {
                            parsedLine[headings[columnIndex]] = values[columnIndex];
                            columnIndex += 1;
                        }

                        parsedRows.push(parsedLine);
                        line_index += 1
                    }

                    return parsedRows
                };

                scope.initialize = function() {
                    scope.binnedData = {};
                    scope.minYear = 2018;
                    scope.maxYear = 0;

                    for(var i = 0; i < scope.letterData.length; i++){
                        var currentLetter = scope.letterData[i];

                        var fromDate = new Date(currentLetter['origin_date_from']);
                        var toDate = new Date(currentLetter['origin_date_to']);

                        if(fromDate.toString() === 'Invalid Date' || toDate.toString() === 'Invalid Date'){
                            continue;
                        }

                        if((fromDate.getFullYear() === toDate.getFullYear())) {
                            var year = fromDate.getFullYear().toString();

                            if(year < scope.minYear) scope.minYear = year;
                            if(year > scope.maxYear) scope.maxYear = year;

                            if(year in scope.binnedData) {
                                scope.binnedData[year] += 1
                            } else {
                                scope.binnedData[year] = 1
                            }
                        } else {
                            var fromYear = fromDate.getFullYear().toString();
                            var toYear = toDate.getFullYear().toString();

                            if(fromYear < scope.minYear) scope.minYear = fromYear;
                            if(toYear > scope.maxYear) scope.maxYear = toYear;

                            if(fromYear in scope.binnedData) {
                                scope.binnedData[fromYear] += 1
                            } else {
                                scope.binnedData[fromYear] = 1
                            }

                            if(toYear in scope.binnedData) {
                                scope.binnedData[toYear] += 1
                            } else {
                                scope.binnedData[toYear] = 1
                            }
                        }
                    }
                };

                scope.updateState = function () {

                }
            }
        }
    }]);
'use strict';


angular.module('arachne.visualizations.directives')
    .directive('con10tLineChart', ['$http', '$q', function ($http, $q) {
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

                        var margin = {top: 20, right: 50, bottom: 30, left: 50},
                            width = 960 - margin.left - margin.right,
                            height = 200 - margin.top - margin.bottom;

                        var bisectDate = d3.bisector(function(d) { return d.date; }).left;

                        var x = d3.scaleTime()
                            .range([0, width]);

                        var y = d3.scaleLinear()
                            .range([height, 0]);

                        var xAxis = d3.axisBottom()
                            .scale(x);

                        var yAxis = d3.axisLeft()
                            .scale(y);

                        var line = d3.line()
                            .x(function(d) { return x(d.date); })
                            .y(function(d) { return y(d.close); });

                        var svg = d3.select("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                        var data = [];

                        for (var key in scope.binnedData) {
                            var current = scope.binnedData[key];
                            var d = {};
                            d['date'] = new Date(key);
                            d['close'] = current;

                            data.push(d)
                        }

                        data.sort(function(a, b) {
                            return a.date - b.date;
                        });


                        x.domain([data[0].date, data[data.length - 1].date]);
                        y.domain(d3.extent(data, function(d) { return d.close; }));

                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis);

                        svg.append("g")
                            .attr("class", "y axis")
                            .call(yAxis)
                            .append("text")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 6)
                            .attr("dy", ".71em")
                            .style("text-anchor", "end")
                            .text("Price ($)");

                        svg.append("path")
                            .datum(data)
                            .attr("class", "line")
                            .attr("d", line);

                        var focus = svg.append("g")
                            .attr("class", "focus")
                            .style("display", "none");

                        focus.append("circle")
                            .attr("r", 4.5);

                        focus.append("text")
                            .attr("x", 9)
                            .attr("dy", ".35em");

                        svg.append("rect")
                            .attr("class", "overlay")
                            .attr("width", width)
                            .attr("height", height)
                            .on("mouseover", function() { focus.style("display", null); })
                            .on("mouseout", function() { focus.style("display", "none"); })
                            .on("mousemove", mousemove);

                        function mousemove() {
                            var x0 = x.invert(d3.mouse(this)[0]),
                                i = bisectDate(data, x0, 1),
                                d0 = data[i - 1],
                                d1 = data[i],
                                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                            focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
                            focus.select("text").text(d.close);
                        }

                        console.log('peepEnd');
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
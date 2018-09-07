'use strict';


angular.module('arachne.visualizations.directives')
    .directive('con10tTimeLineChart', ['$http', '$q', function ($http, $q) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-time-line-chart.html',
            scope: {
                letterDataPath: '@',
                minDate: '=',
                maxDate: '='
            },
            link: function (scope, element, attrs) {
                var dataQueries = [];

                dataQueries.push($http.get(scope.letterDataPath));

                scope.selectionStartDate = null;
                scope.selectionEndDate = null;

                $q.all(dataQueries)
                    .then(function(responses) {
                        scope.processTsvData(
                            scope.parseTsvData(responses[0].data)
                        );
                        scope.initializeD3();
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

                scope.processTsvData = function(tsvData) {
                    scope.data = [];
                    scope.binnedData = {};
                    scope.overallMinDate = new Date('2018-01-01');
                    scope.overallMaxDate = new Date('0000-01-01');

                    for(var i = 0; i < tsvData.length; i++){
                        var currentLetter = tsvData[i];

                        var fromDate = new Date(currentLetter['origin_date_from']);
                        var toDate = new Date(currentLetter['origin_date_to']);

                        if(fromDate.toString() === 'Invalid Date' || toDate.toString() === 'Invalid Date'){
                            continue;
                        }

                        if(fromDate.toISOString() === toDate.toISOString()) {
                            var binKey = fromDate.toISOString().substr(0,4);

                            if(new Date(binKey) < scope.overallMinDate) scope.overallMinDate = new Date(binKey);
                            if(new Date(binKey) > scope.overallMaxDate) scope.overallMaxDate = new Date(binKey);

                            if(binKey in scope.binnedData) {
                                scope.binnedData[binKey] += 1
                            } else {
                                scope.binnedData[binKey] = 1
                            }
                        } else {
                            var fromBinKey = fromDate.toISOString().substr(0,4);
                            var toBinKey = toDate.toISOString().substr(0,4);

                            if(new Date(fromBinKey) < scope.overallMinDate) scope.overallMinDate = new Date(fromBinKey);
                            if(new Date(toBinKey) > scope.overallMaxDate) scope.overallMaxDate = new Date(toBinKey);

                            if(fromBinKey in scope.binnedData) {
                                scope.binnedData[fromBinKey] += 1
                            } else {
                                scope.binnedData[fromBinKey] = 1
                            }

                            if(toBinKey in scope.binnedData) {
                                scope.binnedData[toBinKey] += 1
                            } else {
                                scope.binnedData[toBinKey] = 1
                            }
                        }
                    }

                    for(var binKey in scope.binnedData){
                        scope.data.push({
                            'date': new Date(binKey),
                            'count': scope.binnedData[binKey]
                        });
                    }

                    scope.data.sort(function(a, b) {
                        return a.date - b.date;
                    });

                    var getYearsInbetween = function (startYear, endYear) {
                        var result = [];
                        var currentYear = startYear + 1;

                        while(currentYear < endYear){
                            result.push(
                                {
                                    'date': new Date(currentYear, 1, 1),
                                    'count': 0
                                });
                            currentYear += 1;
                        }

                        return result;
                    };

                    for(var i = 0; i < scope.data.length - 1; i++) {

                        if(scope.data[i]['date'].getFullYear() + 1 !== scope.data[i + 1]['date'].getFullYear()){
                            var inbetween = getYearsInbetween(
                                scope.data[i]['date'].getFullYear(),
                                scope.data[i + 1]['date'].getFullYear()
                            );

                            for(var j = 0; j < inbetween.length; j++){
                                scope.data.splice(i + 1 + j, 0, inbetween[j])
                            }
                        }
                    }
                };

                scope.initializeD3 = function(){

                    outerWidth = 480;
                    if(element.length === 1 && element[0].offsetWidth !== 0){
                        outerWidth = element[0].offsetWidth
                    }

                    var margin = {top: 20, right: 50, bottom: 30, left: 50},
                        width = outerWidth - margin.left - margin.right,
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
                        .y(function(d) { return y(d.count); });

                    scope.svg = d3.select("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    x.domain([scope.data[0].date, scope.data[scope.data.length - 1].date]);
                    y.domain(d3.extent(scope.data, function(d) { return d.count; }));

                    scope.svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    scope.svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Price ($)");

                    scope.svg.append("path")
                        .datum(scope.data)
                        .attr("class", "line")
                        .attr("d", line);

                    var selection = scope.svg.append('rect')
                        .attr('x', 10)
                        .attr('y', 0)
                        .attr('width', 50)
                        .attr('height', height)
                        .attr('opacity', .0)
                        .style("fill", '#729AB4');

                    var focus = scope.svg.append("g")
                        .attr("class", "focus")
                        .style("display", "none");

                    focus.append("circle")
                        .attr("r", 4.5);

                    focus.append("text")
                        .attr("x", 9)
                        .attr("dy", ".35em");

                    scope.svg.append("rect")
                        .attr("class", "overlay")
                        .attr("width", width)
                        .attr("height", height)
                        .on("mouseover", function() { focus.style("display", null); })
                        .on("mouseout", function() { focus.style("display", "none"); })
                        .on("mousemove", mousemove);

                    function mousemove() {
                        var x0 = x.invert(d3.mouse(this)[0]),
                            i = bisectDate(scope.data, x0, 1),
                            d0 = scope.data[i - 1],
                            d1 = scope.data[i],
                            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                        focus.attr("transform", "translate(" + x(d.date) + "," + y(d.count) + ")");
                        focus.select("text").text(d.date.getFullYear() + '(' + d.count +')');
                    }

                    function dragStart() {
                        var mousePosition = d3.mouse(this);
                        var xPos = mousePosition[0];

                        if(xPos < 0) xPos = 0;
                        if(xPos > width) xPos = width;

                        scope.startPosition = xPos;

                        scope.selectionStartDate = null;
                        scope.selectionEndDate = null;

                        selection.attr('width', 0);
                        selection.attr("opacity", .5);
                        selection.attr('x', xPos);

                        scope.selectionStartDate = getDateForPosition(xPos);
                    }

                    function dragMove() {
                        var mousePosition = d3.mouse(this);
                        var xPos = mousePosition[0];

                        if(xPos < 0) xPos = 0;
                        if(xPos > width) xPos = width;

                        if(scope.startPosition < xPos) {
                            selection.attr('width', xPos - scope.startPosition)
                        } else {
                            selection.attr('x', xPos);
                            selection.attr('width', scope.startPosition - xPos)
                        }

                        scope.selectionEndDate = getDateForPosition(xPos);
                        scope.updateState()
                    }

                    function dragEnd() {
                    }

                    function getDateForPosition(xPos) {
                        // TODO: second (invisible?) x axis that contains has a day stepsize instead of years
                        var i = bisectDate(scope.data, x.invert(xPos), 1);
                        var d0 = scope.data[i - 1],
                            d1 = scope.data[i],
                            date = xPos - d0.date > d1.date - xPos ? d1 : d0;

                        return date;
                    }

                    var dragBehavior = d3.drag()
                        .on("drag", dragMove)
                        .on("start", dragStart)
                        .on("end", dragEnd);

                    scope.svg.call(dragBehavior);
                };

                scope.updateState = function () {

                    if(scope.selectionStartDate != null && scope.selectionEndDate != null){
                        scope.minDate = null;
                        scope.maxDate = null;

                        if(scope.selectionStartDate['date'] < scope.selectionEndDate['date']){
                            scope.minDate = scope.selectionStartDate['date'];
                            scope.maxDate = scope.selectionEndDate['date'];

                        } else if(scope.selectionStartDate['date'] > scope.selectionEndDate['date']){
                            scope.minDate = scope.selectionEndDate['date'];
                            scope.maxDate = scope.selectionStartDate['date'];
                        } else {
                            scope.minDate = scope.maxDate = scope.selectionEndDate['date'];
                        }
                    }

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                }
            }
        }
    }]);
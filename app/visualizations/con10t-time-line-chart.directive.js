'use strict';


angular.module('arachne.visualizations.directives')
    .directive('con10tTimeLineChart', ['$http', '$q', '$filter', function ($http, $q, $filter) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-time-line-chart.html',
            scope: {
                objectDataPath: '@',
                reportOnDrag: '@',  // Pass "true" if you want to evaluate minDate/maxDate while dragging, otherwise evaluation will take place at drag end
                minDate: '=',
                maxDate: '='
            },
            link: function (scope, element, attrs) {

                scope.objectDataColumns = [
                    'id', 'timespanFrom', 'timespanTo'
                ];

                var dataQueries = [];
                dataQueries.push($http.get(scope.objectDataPath));

                scope.dragStartDate = null;
                scope.dragEndDate = null;

                $q.all(dataQueries)
                    .then(function(responses) {
                        scope.objectData = scope.processTsvData(
                            $filter('tsvData')(responses[0].data, scope.objectDataColumns)
                        );

                        scope.initializeD3();
                        scope.evaluateState();
                    });

                scope.processTsvData = function(tsvData) {
                    scope.data = [];
                    scope.binnedData = {};
                    scope.overallMinDate = new Date('2018-01-01');
                    scope.overallMaxDate = new Date('0000-01-01');

                    for(var i = 0; i < tsvData.length; i++){
                        var currentObject = tsvData[i];

                        var fromDate = new Date(currentObject['timespanFrom']);
                        var toDate = new Date(currentObject['timespanTo']);

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

                    scope.generateDetailedTimeSpan(scope.overallMinDate, scope.overallMaxDate)
                };

                scope.generateDetailedTimeSpan = function(minDate, maxDate) {
                    scope.detailedDates = [];
                    scope.detailedDates.push(minDate);

                    var addDays = function(inputDate, n)
                    {
                        return new Date(
                            inputDate.getFullYear(),
                            inputDate.getMonth(),
                            inputDate.getDate() + n,
                            inputDate.getHours(),
                            inputDate.getMinutes(),
                            inputDate.getSeconds());
                    };

                    var currentDate = minDate;
                    while(currentDate < maxDate){
                        var newDate = addDays(currentDate, 1);
                        scope.detailedDates.push(newDate);
                        currentDate = newDate;
                    }

                    scope.detailedDates.push(maxDate);
                };

                scope.initializeD3 = function(){

                    var outerWidth = 480;
                    var outerHeight = 200;
                    if(element.length === 1){
                        if(element[0].offsetWidth !== 0){
                            outerWidth = element[0].offsetWidth
                        }
                        if(element[0].offsetHeight !== 0){
                            outerHeight = element[0].offsetHeight;
                        }
                    }

                    var margin = {top: 20, right: 50, bottom: 30, left: 50},
                        width = outerWidth - margin.left - margin.right,
                        height = outerHeight - margin.top - margin.bottom;

                    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

                    var bisectDetailedDate = d3.bisector(function(d) { return d; }).left;

                    var x = d3
                        .scaleTime()
                        .range([0, width]);

                    var xDetailed = d3
                        .scaleTime()
                        .range([0, width]);

                    var y = d3
                        .scaleLinear()
                        .range([height, 0]);

                    var xAxis = d3
                        .axisBottom()
                        .scale(x);

                    var yAxis = d3
                        .axisLeft()
                        .scale(y);

                    var line = d3
                        .line()
                        .x(function(d) { return x(d.date); })
                        .y(function(d) { return y(d.count); });

                    scope.svg = d3
                        .select("#timeline-container")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    x.domain([scope.data[0].date, scope.data[scope.data.length - 1].date]);
                    xDetailed.domain([scope.detailedDates[0], scope.detailedDates[scope.detailedDates.length - 1]]);
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

                    scope.selectionBox = scope.svg.append('rect')
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
                        .on("mousemove", function () {
                            var x0 = x.invert(d3.mouse(this)[0]),
                                i = bisectDate(scope.data, x0, 1),
                                d0 = scope.data[i - 1],
                                d1 = scope.data[i],
                                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                            focus.attr("transform", "translate(" + x(d.date) + "," + y(d.count) + ")");
                            focus.select("text").text(d.date.getFullYear() + '(' + d.count +')');
                        })
                        .on('click', function () {
                            var x0 = x.invert(d3.mouse(this)[0]),
                                i = bisectDate(scope.data, x0, 1);

                            scope.dragStartDate = scope.data[i]['date'];
                            scope.dragEndDate = scope.data[i + 1]['date'];
                            scope.evaluateState();
                        });


                    function dragStart() {
                        var mousePosition = d3.mouse(this);
                        var xPos = mousePosition[0];

                        if(xPos < 0) xPos = 0;
                        if(xPos > width) xPos = width;

                        scope.dragStartPosition = xPos;

                        scope.dragStartDate = null;
                        scope.dragEndDate = null;

                        scope.selectionBox.attr('width', 0);
                        scope.selectionBox.attr("opacity", .5);
                        scope.selectionBox.attr('x', xPos);

                        scope.dragStartDate = getDateForPosition(xPos);
                    }

                    function dragMove() {
                        var mousePosition = d3.mouse(this);
                        var xPos = mousePosition[0];

                        if(xPos < 0) xPos = 0;
                        if(xPos > width) xPos = width;

                        if(scope.dragStartPosition < xPos) {
                            scope.selectionBox.attr('width', xPos - scope.dragStartPosition)
                        } else {
                            scope.selectionBox.attr('x', xPos);
                            scope.selectionBox.attr('width', scope.dragStartPosition - xPos)
                        }

                        if(scope.reportOnDrag  === 'true'){
                            scope.dragEndDate = getDateForPosition(xPos);
                            scope.evaluateState()
                        }

                    }

                    function dragEnd() {
                        if(scope.reportOnDrag !== 'true'){
                            var mousePosition = d3.mouse(this);
                            var xPos = mousePosition[0];

                            if(xPos < 0) xPos = 0;
                            if(xPos > width) xPos = width;

                            scope.dragEndDate = getDateForPosition(xPos);
                            scope.evaluateState()
                        }
                    }

                    function getDateForPosition(xPos) {
                        // TODO: second (invisible?) x axis that contains has a day step size instead of years

                        // Get the x-axis data index where the current xPos value would be inserted...
                        var i = bisectDetailedDate(scope.detailedDates, xDetailed.invert(xPos), 1);
                        // ... then check which of the neighbouring values is closer and return the closer one's date.
                        var d0 = scope.detailedDates[i - 1],
                            d1 = scope.detailedDates[i];
                        return xPos - d0 > d1 - xPos ? d1 : d0;
                    }

                    var dragBehavior = d3.drag()
                        .on("drag", dragMove)
                        .on("start", dragStart)
                        .on("end", dragEnd);

                    scope.svg.call(dragBehavior);
                };

                scope.reset = function() {
                    scope.dragStartDate = scope.overallMinDate;
                    scope.dragEndDate = scope.overallMaxDate;

                    scope.selectionBox.attr("opacity", .0);

                    scope.evaluateState();
                };

                scope.evaluateState = function () {

                    if(scope.dragStartDate != null && scope.dragEndDate != null){
                        scope.minDate = null;
                        scope.maxDate = null;

                        if(scope.dragStartDate < scope.dragEndDate){
                            scope.minDate = scope.dragStartDate;
                            scope.maxDate = scope.dragEndDate;
                        } else if(scope.dragStartDate > scope.dragEndDate){
                            scope.minDate = scope.dragEndDate;
                            scope.maxDate = scope.dragStartDate;
                        } else {
                            scope.minDate = scope.maxDate = scope.dragEndDate;
                        }
                    }

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                }
            }
        }
    }]);
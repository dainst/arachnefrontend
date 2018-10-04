'use strict';


angular.module('arachne.visualizations.directives')
    .directive('con10tTimeLineChart', ['$http', '$q', '$filter', function ($http, $q, $filter) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-time-line-chart.html',
            scope: {
                reportOnDrag: '@',  // Pass "true" if you want to evaluate minDate/maxDate while dragging, otherwise evaluation will take place at drag end
                overallMinDate: '=',
                overallMaxDate: '=',
                minDate: '=',
                maxDate: '=',
                data: '='
            },
            link: function (scope, element, attrs) {
                scope.evaluateOverallTimespan = function(){
                    scope.overallMaxDate = new Date(-8640000000000000);
                    scope.overallMinDate = new Date(8640000000000000);

                    for(var i = 0; i < scope.data.length; i++){

                        if(scope.data[i].date > scope.overallMaxDate){
                            scope.overallMaxDate = new Date(scope.data[i].date);
                        }

                        if(scope.data[i].date < scope.overallMinDate){
                            scope.overallMinDate = new Date(scope.data[i].date);
                        }
                    }
                };

                scope.generateDetailedTimeSpan = function() {
                    scope.detailedDates = [];
                    scope.detailedDates.push(scope.overallMinDate);

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

                    var currentDate = scope.overallMinDate;
                    while(currentDate < scope.overallMaxDate){
                        var newDate = addDays(currentDate, 1);
                        scope.detailedDates.push(newDate);
                        currentDate = newDate;
                    }

                    scope.detailedDates.push(scope.overallMaxDate);
                };

                scope.initializeD3 = function(){

                    d3.select("#timeline-container").selectAll("*").remove();
                    var svgElement = document.querySelector('#timeline-container');

                    svgElement.removeAttribute('width');
                    svgElement.removeAttribute('height');

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

                    scope.xDetailed = d3
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
                    scope.xDetailed.domain(
                        [scope.detailedDates[0], scope.detailedDates[scope.detailedDates.length - 1]]
                    );
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


                    var clickPreview = scope.svg.append('rect')
                        .attr("class", "focus")
                        .style("display", "none")
                        .attr('y', 0)
                        .attr('height', height)
                        .attr('opacity', .8)
                        .style('fill-opacity', 0)
                        .style('stroke-width', 1.5)
                        .style('stroke', '#324554');

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
                        .on("mouseover", function() {
                            focus.style("display", null);
                            clickPreview.style("display", null);
                        })
                        .on("mouseout", function() {
                            focus.style("display", "none");
                            clickPreview.style("display", "none");
                        })
                        .on("mousemove", function () {
                            var xPos = x.invert(d3.mouse(this)[0]),
                                i = bisectDate(scope.data, xPos, 1),
                                d1 = scope.data[i - 1],
                                d2 = scope.data[i],
                                d = xPos - d1.date > d2.date - xPos ? d2 : d1;
                            focus.attr("transform", "translate(" + x(d.date) + "," + y(d.count) + ")");
                            focus.select("text").text(d.date.getFullYear() + '(' + d.count +')');

                            var x1 = x(d1.date);
                            var x2 = x(d2.date);

                            clickPreview.attr('x', x1);
                            clickPreview.attr('width', x2 - x1);
                        });


                    function dragStart() {
                        var mousePosition = d3.mouse(this);
                        var xPos = mousePosition[0];

                        if(xPos < 0) xPos = 0;
                        if(xPos > width) xPos = width;

                        scope.dragStartPosition = xPos;

                        scope.dragStartDate = null;
                        scope.dragEndDate = null;

                        scope.dragStartDate = getDetailedDateForPosition(xPos);
                    }

                    function dragMove() {
                        var mousePosition = d3.mouse(this);
                        var xPos = mousePosition[0];

                        if(xPos < 0) xPos = 0;
                        if(xPos > width) xPos = width;

                        scope.dragEndDate = getDetailedDateForPosition(xPos);
                        scope.drawSelection(scope.dragStartPosition, xPos);
                        if(scope.reportOnDrag  === 'true'){
                            scope.evaluateState();
                        }
                    }

                    function dragEnd() {
                        if(scope.reportOnDrag !== 'true'){
                            var mousePosition = d3.mouse(this);
                            var xPos = mousePosition[0];

                            if(xPos < 0) xPos = 0;
                            if(xPos > width) xPos = width;

                            scope.dragEndPosition = xPos;
                            if(scope.dragStartPosition === scope.dragEndPosition){
                                scope.dragStartDate = new Date(
                                    getDateForPosition(xPos)
                                );
                                scope.dragEndDate =  new Date(
                                    (getDateForPosition(xPos).getFullYear() + 1).toString()
                                );
                            } else {
                                scope.dragEndDate = getDetailedDateForPosition(xPos);
                            }
                            scope.evaluateState();
                            scope.drawSelection(scope.dragStartPosition, scope.dragEndPosition);
                        }
                    }

                    function getDateForPosition(xPos){
                        // Get the x-axis data index where the current xPos value would be inserted...
                        var i = bisectDate(scope.data, x.invert(xPos), 1);
                        // ... then check which of the neighbouring values is closer and return the closer one's date.
                        return scope.data[i - 1]['date'];
                    }

                    function getDetailedDateForPosition(xPos) {
                        // Get the x-axis data index where the current xPos value would be inserted...
                        var i = bisectDetailedDate(scope.detailedDates, scope.xDetailed.invert(xPos), 1);
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
                            console.log(scope.dragStartDate, scope.dragEndDate);
                            scope.minDate = scope.dragStartDate;
                            scope.maxDate = scope.dragEndDate.getFullYear() + 1;
                        }
                    }

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.getPositionForDate = function(date){
                    return scope.xDetailed(date)
                };

                scope.drawSelection = function(x1, x2){
                    if(x1 < x2) {
                        scope.selectionBox.attr("opacity", .5);
                        scope.selectionBox.attr('x', x1);
                        scope.selectionBox.attr('width', x2 - x1)
                    } else if(x1 > x2) {
                        scope.selectionBox.attr("opacity", .5);
                        scope.selectionBox.attr('x', x2);
                        scope.selectionBox.attr('width', x1 - x2)
                    } else {
                        scope.selectionBox.attr("opacity", .0);
                    }
                };

                scope.recreate = function() {
                    scope.evaluateOverallTimespan();
                    scope.generateDetailedTimeSpan();
                    scope.initializeD3();

                    scope.dragStartDate = scope.minDate;
                    scope.dragEndDate = scope.maxDate;

                    scope.dragStartPosition = scope.getPositionForDate(scope.dragStartDate);
                    scope.dragEndPosition = scope.getPositionForDate(scope.dragEndDate);

                    scope.evaluateState();
                };

                scope.dragStartDate = null;
                scope.dragEndDate = null;

                scope.$watch('data', function(newValue, oldValue) {
                    if(typeof newValue === 'undefined'){
                        return;
                    }
                    scope.recreate();
                });

            }
        }
    }]);
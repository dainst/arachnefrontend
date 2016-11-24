'use strict';

angular.module('arachne.controllers')
    .controller('CategoriesController', ['$rootScope', '$scope', '$http', '$filter', 'categoryService',
        function ($rootScope, $scope, $http, $filter, categoryService) {

            $rootScope.hideFooter = false;

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = [];
                for (var key in categories) {
                    if (categories[key].status != 'none') {
                        $scope.categories.push(categories[key]);
                    }
                }
                drawGraph();
            });

            function drawGraph () {
                d3.json("config/category_relations.json", function(classes) {
                    $scope.graphClasses = classes
                    var matrix = generateMatrix(classes);

                    var svg = d3.select("svg"),
                    width = +svg.attr("width"),
                    height = +svg.attr("height"),
                    outerRadius = Math.min(width, height) * 0.5 - 120,
                    innerRadius = outerRadius - 30;


                    var chord = d3.chord()
                        .padAngle(0.05)
                        .sortSubgroups(d3.descending);

                    var arc = d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);

                    var ribbon = d3.ribbon()
                        .radius(innerRadius);

                    var color = d3.scaleOrdinal()
                        .domain(d3.range(4))
                        .range(["#5572a1", "#ff0000"]);

                    var g = svg.append("g")
                        .attr("transform", "translate(" + width / 2 + "," + (height/2+20) + ")")
                        .datum(chord(matrix));

                    var group = g.append("g")
                        .attr("class", "groups")
                      .selectAll("g")
                        .data(function(chords) { return chords.groups; })
                      .enter().append("g");

                    group.append("path")
                        .style("fill", function(d) { return d3.rgb(color(0)); })
                        .style("stroke", function(d) { return d3.rgb(color(0)).darker(30); })
                        .style("cursor", "pointer")
                        .attr("d", arc)
                        .on("mousedown", mousedown);

                    var groupText = group.append("text")
                        .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
                        .attr("dy", ".35em")
                        .attr("transform", function(d) {
                            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                                + "translate(" + (innerRadius + 36) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
                        })
                        .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
                        .text(function(d) { return $filter('transl8')('type_singular_' + classes[d.index].name); })
                        .style("cursor", "pointer")
                        //.on("mousedown", mousedown);
                        

                    g.append("g")
                        .attr("class", "ribbons")
                      .selectAll("path")
                        .data(function(chords) { return chords; })
                      .enter().append("path")
                        .attr("d", ribbon)
                        .attr("id", function(d) { return "link-" + classes[d.source.index].name + classes[d.target.index].name })
                        .attr("class", function(d) { return "link source-" + classes[d.source.index].name + " target-" + classes[d.target.index].name; })
                        .style("fill", function(d) { return d3.rgb(color(0)).brighter(); })
                        .attr("opacity", 0.8)
                        .style("stroke", function(d) { return d3.rgb(color(0)); });

                    $scope.svg = svg

                    var categoryBoxes = document.getElementsByClassName('ar-imagegrid-cell-link');
                    for (var i = 0, leength = categoryBoxes.length; i < leength; i++) {
                        categoryBoxes[i].addEventListener("mouseover", function () {
                            svg.selectAll("path.link").attr("opacity", 0);
                            var classname = this.attributes['href'].value.split('c=')[1];
                            svg.selectAll("path.link.source-" + classname).attr("opacity", 0.8)
                            svg.selectAll("path.link.target-" + classname).attr("opacity", 0.8)
                        });
                    }

                }) // end d3js-json
            }

            function mousedown(d) {
                var svg = $scope.svg;
                var classes = $scope.graphClasses;

                svg.selectAll("path.link").attr("opacity", 0)
                
                var classname = classes[d.index].name
                svg.selectAll("path.link.source-" + classname).attr("opacity", 0.8)
                svg.selectAll("path.link.target-" + classname).attr("opacity", 0.8)
            }

            function generateMatrix(classes) {
                var nameToIndex = {}
                var matrix = []
                for (var i = 0; i < classes.length; i++) {
                    var klass = classes[i]

                    nameToIndex[klass.name] = i
                    matrix[i] = []

                    for (var u = 0; u < classes.length; u++) {
                        matrix[i][u] = 0
                    }

                    for (var z = 0; z < classes.length; z++) {
                        var klassname = classes[z].name
                        if (klass.connections[klassname] != undefined) {
                            matrix[i][z] = klass.connections[klassname]
                        }
                    }   
                };
                return matrix
            }
        }        
]);
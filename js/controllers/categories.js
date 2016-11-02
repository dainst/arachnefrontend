'use strict';

angular.module('arachne.controllers')

    .controller('CategoriesController', ['$rootScope', '$scope', '$http', '$filter',
        function ($rootScope, $scope, $http, $filter) {

            $rootScope.hideFooter = false;

            d3.json("config/category_relations.json", function(classes) {

                var matrix = generateMatrix(classes);
                generateScopeCategories(classes);

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
                    .range(["#000000", "#caa0e6", 
                        "#6cb9fb", "#3845c7" ,
                        "#cb27bb", "#f64841", 
                        "#005b60", "#6e3a59",
                        "#88fd0b", "#545597",
                        "#aa596a", "#8ad920",
                        "#3db6ff", "#861d3b",
                        "#573d21", "#c81d6e",
                        "#03e25d"]);

                var g = svg.append("g")
                    .attr("transform", "translate(" + width / 2 + "," + (height/2+20) + ")")
                    .datum(chord(matrix));

                var group = g.append("g")
                    .attr("class", "groups")
                  .selectAll("g")
                    .data(function(chords) { return chords.groups; })
                  .enter().append("g");

                group.append("path")
                    .style("fill", function(d) { return color(d.index); })
                    .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
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
                    .on("mousedown", mousedown);
                    

                g.append("g")
                    .attr("class", "ribbons")
                  .selectAll("path")
                    .data(function(chords) { return chords; })
                  .enter().append("path")
                    .attr("d", ribbon)
                    .attr("id", function(d) { return "link-" + classes[d.source.index].name + classes[d.target.index].name })
                    .attr("class", function(d) { return "link source-" + classes[d.source.index].name + " target-" + classes[d.target.index].name; })
                    .style("fill", function(d) { return color(d.target.index); })
                    .attr("opacity", 0)
                    .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); });

                // initially show object-category connections
                svg.selectAll("path.link.target-objekt")
                    .transition()
                    .delay(200)
                    .attr("opacity", 1)
                svg.selectAll("path.link.source-objekt")
                    .transition()
                    .delay(300)
                        .attr("opacity", 1)

                function mousedown(d) {
                    svg.selectAll("path.link").attr("opacity", 0)
                    var intros = document.getElementsByClassName('category_introduction')
                    for (var i = 0; i < intros.length; i++) {
                        intros[i].style.display  = "none"
                    }
                    
                    var classname = classes[d.index].name
                    svg.selectAll("path.link.source-" + classname)
                        .attr("opacity", 1)
                    svg.selectAll("path.link.target-" + classname)
                        .attr("opacity", 1)
                    var intro = document.getElementById("category-"+classname)
                    if (intro != undefined) { intro.style.display = 'block' }
                }
            })

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

            function generateScopeCategories(classes) {
                $scope.categories = [];
                for (var i = 0; i < classes.length; i++)  {
                    $scope.categories.push({
                        key: classes[i].name,
                        imgUri: classes[i].imgUri
                    });

                }
            }
        }        
]);
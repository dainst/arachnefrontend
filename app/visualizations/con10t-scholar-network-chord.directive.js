angular.module('arachne.visualizations.directives')
    .directive('con10tScholarNetworkChord', ['transl8', function (transl8) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-scholar-network-chord.html',
            scope: {
                names: '=',
                colors: '=',
                matrix: '='
            },
            link: function (scope, element, attrs) {
                var dimension = document.body.clientHeight;
                if(element.length === 1){
                    if(element[0].offsetWidth !== 0) {
                        dimension = element[0].offsetWidth;
                    }
                }

                var outerRadius = Math.min(dimension, dimension) * 0.5 - 120;
                var innerRadius = outerRadius - 30;
                var formatValue = d3.formatPrefix(",.0", 1e2);

                console.log(element);
                console.log(dimension);

                var svg = d3
                    .select("#chord-svg")
                    .attr("width", dimension)
                    .attr("height", dimension);

                var chord = d3.chord()
                    .padAngle(0.05)
                    .sortSubgroups(d3.descending);

                var arc = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);

                var ribbon = d3.ribbon()
                    .radius(innerRadius);

                var color = d3.scaleOrdinal()
                    .domain(d3.range(scope.names.length))
                    .range(scope.colors);

                var tooltip = d3.select("body").append("div").attr("class", "toolTip");

                var g = svg.append("g")
                    .attr("transform", "translate(" + dimension / 2 + "," + dimension / 2 + ")")
                    .datum(chord(scope.matrix));

                g.append("g")
                    .attr("class", "ribbons")
                    .selectAll("path")
                    .data(function (chords) {
                        return chords;
                    })
                    .enter().append("path")
                    .attr("d", ribbon)
                    .style("fill", function (d) {
                        return color(d.source.index);
                    })
                    .style("stroke", function (d) {
                        return d3.rgb(color(d.source.index)).darker();
                    })
                    .on("mouseover", mouse_over_path)
                    .on("mouseout", mouse_out);

                var group = g.append("g")
                    .attr("class", "groups")
                    .selectAll("g")
                    .data(function (chords) {
                        return chords.groups;
                    })
                    .enter().append("g")
                    .on("mouseover", mouse_over_group)
                    .on("mouseout", mouse_out);

                group.append("path")
                    .style("fill", function (d) {
                        return color(d.index);
                    })
                    .style("stroke", function (d) {
                        return d3.rgb(color(d.index)).darker();
                    })
                    .attr("d", arc);


                group.append("text")
                    .each(function (d) {
                        d.angle = (d.startAngle + d.endAngle) / 2;
                    })
                    .attr("dy", ".35em")
                    .attr("transform", function (d) {
                        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                            "translate(" + (innerRadius + 64) + ")" +
                            (d.angle > Math.PI ? "rotate(180)" : "");
                    })
                    .style("text-anchor", function (d) {
                        return d.angle > Math.PI ? "end" : null;
                    })
                    .text(function (d) {
                        return scope.names[d.index]
                    });

                group.append("title")
                    .text(function (d, i) {
                        return scope.names[i] + "\n" +
                            d.value + " " + transl8.getTranslation("cont10_authors_chord_letters");
                    });

                var groupTick = group.selectAll(".group-tick")
                    .data(function (d) {
                        return groupTicks(d, 1e2);
                    })
                    .enter().append("g")
                    .attr("class", "group-tick")
                    .attr("transform", function (d) {
                        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)";
                    });

                groupTick.append("line")
                    .attr("x2", 6)
                    .filter(function (d) {
                        return d.value % 1e2 === 0;
                    });

                groupTick.append("text")
                    .attr("x", 8)
                    .attr("dy", ".35em")
                    .attr("transform", function (d) {
                        return d.angle > Math.PI ? "rotate(180) translate(-16)" : null;
                    })
                    .style("text-anchor", function (d) {
                        return d.angle > Math.PI ? "end" : null;
                    })
                    .text(function (d) {
                        return formatValue(d.value);
                    });

                // Returns an array of tick angles and values for a given group and step.
                function groupTicks(d, step) {
                    var k = (d.endAngle - d.startAngle) / d.value;
                    return d3.range(0, d.value, step)
                        .map(function (value) {
                            return {value: value, angle: value * k + d.startAngle};
                        });
                }

                function mouse_over_group(d) {
                    g.select("g.ribbons")
                        .selectAll("path")
                        .classed("fade", function (p) {
                            return p.source.index !== d.index && p.target.index !== d.index;
                        });
                }

                function mouse_over_path(d) {
                    tooltip.style("left", d3.event.pageX - 50 + "px")
                        .style("top", d3.event.pageY - 70 + "px")
                        .style("display", "inline-block")
                        .style("white-space", "pre")
                        .html(
                            scope.names[d.source.index] + " → " + scope.names[d.target.index] + ": " +
                            d3.format("3")(d.source.value) + " " +
                            transl8.getTranslation("cont10_authors_chord_letters") + ".<br\>" +
                            scope.names[d.source.index] + " ← " + scope.names[d.target.index] + ": " +
                            d3.format("3")(d.target.value) +
                            " " + transl8.getTranslation("cont10_authors_chord_letters") + "."
                        );

                    g.select("g.ribbons")
                        .selectAll("path")
                        .classed("fade", function (p) {

                            return d.source.index === d.target.index ?
                                (p.source.index !== d.source.index || p.target.index !== d.target.index) :
                                (p.source.index !== d.source.index && p.target.index !== d.source.index) ||
                                (p.source.index !== d.target.index && p.target.index !== d.target.index);
                        });
                }

                function mouse_out() {
                    tooltip.style("display", "none");
                    g.select("g.ribbons")
                        .selectAll("path")
                        .classed("fade", function () {
                            return false;
                        });
                }
            }
        }
    }]);

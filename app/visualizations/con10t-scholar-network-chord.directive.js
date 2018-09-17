angular.module('arachne.visualizations.directives')
    .directive('con10tScholarNetworkChord', ['transl8', function (transl8) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-scholar-network-chord.html',
            link: function () {
                transl8.onLoaded().then(function () {

                    var names = [
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

                    var colors = [
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

                    var matrix = [
                        // Autoren:
                        // Braun, Brunn, Bunsen, Gerhard, Henzen,  Jahn, Lepsius, Michaelis, Mommsen, Unbekannt
                        // (692),  (56),   (61),  (1479), (1457), (299),   (128),       (0),     (1),      (51)
                        //                                                                                       Rezipienten:
                        [      0,     0,      0,     538,     31,    10,      31,         0,       0,        0], // Braun (610)
                        [      8,     0,      0,      82,    254,     5,       0,         0,       1,        1], // Brunn (351)
                        [    100,     2,      0,      67,     10,     0,      23,         0,       0,       21], // Bunsen (223)
                        [    461,     2,     59,       0,    578,    14,      33,         0,       0,        6], // Gerhard (1153)
                        [     30,    52,      0,     661,      2,     5,      41,         0,       0,        6], // Henzen (797)
                        [      0,     0,      0,       0,      0,     0,       0,         0,       0,        0], // Jahn (0)
                        [     92,     0,      2,      48,    245,     0,       0,         0,       0,        5], // Lepsius (392)
                        [      0,     0,      0,      62,      0,   252,       0,         0,       0,        0], // Michaelis (314)
                        [      1,     0,      0,       0,    337,     1,       0,         0,       0,       12], // Mommsen (351)
                        [      0,     0,      0,      21,      0,    12,       0,         0,       0,        0]  // Unbekannt (33)
                    ];

                    var div = document.querySelector("#svg-container");
                    var width = div.scrollWidth;
                    var height = div.scrollHeight;
                    var outerRadius = Math.min(width, height) * 0.5 - 120;
                    var innerRadius = outerRadius - 30;

                    var formatValue = d3.formatPrefix(",.0", 1e2);
                    var svg = d3.select("svg");

                    var chord = d3.chord()
                        .padAngle(0.05)
                        .sortSubgroups(d3.descending);

                    var arc = d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);

                    var ribbon = d3.ribbon()
                        .radius(innerRadius);

                    var color = d3.scaleOrdinal()
                        .domain(d3.range(names.length))
                        .range(colors);

                    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

                    var g = svg.append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                        .datum(chord(matrix));

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
                            return names[d.index]
                        });

                    group.append("title")
                        .text(function (d, i) {
                            return names[i] + "\n" +
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
                                names[d.source.index] + " → " + names[d.target.index] + ": " +
                                d3.format("3")(d.source.value) + " " +
                                transl8.getTranslation("cont10_authors_chord_letters") + ".<br\>" +
                                names[d.source.index] + " ← " + names[d.target.index] + ": " +
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

                })
            }
        }
    }]);

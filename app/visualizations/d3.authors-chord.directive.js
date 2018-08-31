angular.module('arachne.visualizations.directives')
    .directive('con10tD3AuthorsChord', function () { // con10t-d3
        return {
            restrict: 'E',
            scope: {
                spec: '@',
                name: '@'
            },
            link: function () {
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
                var matrix = [
                    // Autoren:
                    // Braun, Brunn, Bunsen, Gerhard, Henzen, Jahn, Lepsius, Michaelis, Mommsen, Unbekannt
                    [      0,     0,      0,     538,     31,   10,      31,         0,       0,        0], // Braun
                    [      8,     0,      0,      82,    254,    5,       0,         0,       1,        1], // Brunn
                    [    100,     2,      0,      67,     10,    0,      23,         0,       0,       21], // Bunsen
                    [    461,     2,     59,       0,    578,   14,      33,         0,       0,        6], // Gerhard
                    [     30,    52,      0,     661,      2,    5,      41,         0,       0,        6], // Henzen
                    [      0,     0,      0,       0,      0,    0,       0,         0,       0,        0], // Jahn
                    [     92,     0,      2,      48,    245,    0,       0,         0,       0,        5], // Lepsius
                    [      0,     0,      0,      62,      0,  252,       0,         0,       0,        0], // Michaelis
                    [      1,     0,      0,       0,    337,    1,       0,         0,       0,       12], // Mommsen
                    [      0,     0,      0,      21,      0,   12,       0,         0,       0,        0]  // Unbekannt
                ];

                var svg = d3.select("svg"),
                    width = +svg.attr("width"),
                    height = +svg.attr("height"),
                    outerRadius = Math.min(width, height) * 0.5 - 40,
                    innerRadius = outerRadius - 30;

                var formatValue = d3.formatPrefix(",.0", 1e3);

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
                    .range([
                        "#cd3d08", "#ec8f00", "#6dae29", "#683f92", "#b60275",
                        "#2058a5", "#00a592", "#009d3c", "#378974", "#ffca00"
                    ]);

                var g = svg.append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                    .datum(chord(matrix));

                var group = g.append("g")
                    .attr("class", "groups")
                    .selectAll("g")
                    .data(function (chords) {
                        return chords.groups;
                    })
                    .enter().append("g");

                group.append("path")
                    .style("fill", function (d) {
                        return color(d.index);
                    })
                    .style("stroke", function (d) {
                        return d3.rgb(color(d.index)).darker();
                    })
                    .attr("d", arc);

                var groupTick = group.selectAll(".group-tick")
                    .data(function (d) {
                        return groupTicks(d, 1e3);
                    })
                    .enter().append("g")
                    .attr("class", "group-tick")
                    .attr("transform", function (d) {
                        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)";
                    });

                groupTick.append("line")
                    .attr("x2", 6);

                groupTick
                    .filter(function (d) {
                        return d.value % 5e3 === 0;
                    })
                    .append("text")
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

                g.append("g")
                    .attr("class", "ribbons")
                    .selectAll("path")
                    .data(function (chords) {
                        return chords;
                    })
                    .enter().append("path")
                    .attr("d", ribbon)
                    .style("fill", function (d) {
                        return color(d.target.index);
                    })
                    .style("stroke", function (d) {
                        return d3.rgb(color(d.target.index)).darker();
                    });

                // Returns an array of tick angles and values for a given group and step.
                function groupTicks(d, step) {
                    var k = (d.endAngle - d.startAngle) / d.value;
                    return d3.range(0, d.value, step).map(function (value) {
                        return {value: value, angle: value * k + d.startAngle};
                    });
                }
            }
        }
    });

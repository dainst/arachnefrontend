import * as d3 from 'd3';
import CATEGORY_RELATIONS from './category_relations.json';

export default function ($rootScope, $scope, $filter, categoryService) {

    $rootScope.tinyFooter = false;

    categoryService.getCategoriesAsync().then(function (categories) {
        $scope.categories = [];
        angular.forEach(Object.keys(categories), function(key) {
            if (categories[key].status !== 'none') {
                $scope.categories.push(categories[key]);
            }
        });
        drawGraph();
    });

    function drawGraph () {
        
        const classes = CATEGORY_RELATIONS;

        var category_graph = document.getElementById('category_graph');
        category_graph.setAttribute('width', (window.innerWidth/2));
        category_graph.setAttribute('height', (window.innerWidth/2) - 50);
        
        // move images to lower part of the graph
        for (var i = 0, length = classes.length; i < length; i++) {
            if (classes[i].name === "marbilder") {
                classes.splice(4, 0, classes.splice(i, 1)[0]);
                break;
            }
        }

        $scope.graphClasses = classes;
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
            .style("fill", function(d) {
                return classes[d.index].name === "marbilder" ? "rgb(230, 230, 230)" : d3.rgb(color(0)); })
            .style("stroke", function() { return d3.rgb(color(0)).darker(30); })
            .attr("class", function(d) { return "bar bar-" + classes[d.index].name; })
            .style("cursor", "pointer")
            .attr("d", arc)
            .on("mouseover", graph_mouseover)
            .on("mousedown", graph_mousedown);

        group.append("text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (innerRadius + 36) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(function(d) { return $filter('transl8')('type_' + classes[d.index].name); })
            .style("cursor", "pointer")
            .on("mouseover", graph_mouseover)
            .on("mousedown", graph_mousedown);

        g.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
            .data(function(chords) { return chords; })
            .enter().append("path")
            .attr("d", ribbon)
            .attr("id", function(d) {
                return "link-" + classes[d.source.index].name + classes[d.target.index].name })
            .attr("class", function(d) {
                return "link source-" +
                    classes[d.source.index].name +
                    " target-" + classes[d.target.index].name; })
            .style("fill", function() { return d3.rgb(color(0)).brighter(); })
            .attr("opacity", 0.8)
            .style("stroke", function() { return d3.rgb(color(0)); });

        $scope.svg = svg;

        
        for (var categoryBoxes = document.getElementsByClassName('ar-imagegrid-cell-link'),
                    j = 0, leength = categoryBoxes.length; j < leength; j++) {
            categoryBoxes[j].addEventListener("mouseover", function () {
                svg.selectAll("path.link").attr("opacity", 0);
                var classname = this.attributes['href'].value.split('c=')[1];
                this.setAttribute('id',classname + "_box");
                svg.selectAll("path.link.source-" + classname).attr("opacity", 0.8);
                svg.selectAll("path.link.target-" + classname).attr("opacity", 0.8)
            });

        }
        document.getElementById('categories_container').addEventListener("mouseout", function () {
                svg.selectAll("path.link").attr("opacity", 0.8);
        });
        document.getElementById('categories_graph_container').addEventListener("mouseout", function () {
            svg.selectAll("path.link").attr("opacity", 0.8);
            for (var catBoxes = document.getElementsByClassName('ar-imagegrid-cell-link'),
                    leength = catBoxes.length, i = 0; i < leength; i++) {
                catBoxes[i].style.opacity = 1.0;
                catBoxes[i].classList.remove('hover')
            }
            svg.selectAll("path.bar").attr("opacity", 1.0);
        });

    }

    function graph_mouseover(d) {
        var svg = $scope.svg;
        var classes = $scope.graphClasses;
        var classname = classes[d.index].name;
        //focus relations
        svg.selectAll("path.link").attr("opacity", 0);
        svg.selectAll("path.link.source-" + classname).attr("opacity", 0.8);
        svg.selectAll("path.link.target-" + classname).attr("opacity", 0.8);

        //focus circle bar
        svg.selectAll("path.bar").attr("opacity", 0.4);
        svg.selectAll("path.bar-" + classname).attr("opacity", 1.0);
        
        for (var catBoxes = document.getElementsByClassName('ar-imagegrid-cell-link'),
                i = 0, leength = catBoxes.length; i < leength; i++) {
            if( catBoxes[i].attributes['href'].value === "category/?c=" + classname) {
                catBoxes[i].style.opacity = 1.0;
                catBoxes[i].classList.add('hover')
            } else {
                catBoxes[i].style.opacity = 0.3;
                catBoxes[i].classList.remove('hover')
            }
        }
    }

    function graph_mousedown(d) {
        var classes = $scope.graphClasses;
        location.href = "category/?c=" + classes[d.index].name;
    }

    function generateMatrix(classes) {
        var nameToIndex = {};
        var matrix = [];
        for (var i = 0, leength = classes.length; i < leength; i++) {
            var klass = classes[i];

            nameToIndex[klass.name] = i;
            matrix[i] = [];

            for (var u = 0; u < classes.length; u++) {
                matrix[i][u] = 0
            }

            for (var z = 0; z < classes.length; z++) {
                var klassname = classes[z].name;
                if (klass.connections[klassname] !== undefined) {
                    matrix[i][z] = klass.connections[klassname]
                }
            }   
        }
        return matrix
    }
};

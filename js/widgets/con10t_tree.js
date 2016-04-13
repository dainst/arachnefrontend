'use strict';

/* Widget directives */
angular.module('arachne.widgets.directives')

/**
 * @author: Sebastian Cuy
 */
.directive('con10tTree', ['Query', 'Entity', '$location', function(Query, Entity, $location) {
    return {
        restrict: 'E',
        templateUrl: 'partials/widgets/con10t-tree.html',
        scope: {},
        link: function(scope, element, attrs) {
            scope.staticFacets = [];
            if (!attrs.fq) return;

            var fq_facets = attrs.fq.split(',');
            for (var i = 0; i < fq_facets.length; i++) {
                scope.staticFacets.push(fq_facets[i].split(':'));
            }
            scope.wildcardFacet = attrs.wildcardFacet;
            scope.hierarchyFacets = [];

            if (attrs.hierarchyFacets)
                scope.hierarchyFacets = attrs.hierarchyFacets.split(',');

            // in the UI, the tree starts with the last provided static facet's name
            scope.treeRoot = [{
                name: scope.staticFacets[scope.staticFacets.length - 1][1],
                depth: 0,
                children: [],
                facet: null,
                parent: null,
                id: "0"
            }];
            scope.isShown = {};

            scope.getNodeChildren = function(node) {

                // TODO add proper object check
                if (node.children != 0) {
                    return;
                }

                var treeQuery = new Query();

                for (var i = 0; i < scope.staticFacets.length; i++) {
                    treeQuery = treeQuery.addFacet(scope.staticFacets[i][0], scope.staticFacets[i][1]);
                }

                var collectedFacets = this.collectAllFacets(node);

                for (var i = 0; i < collectedFacets.length; i++) {
                    treeQuery = treeQuery.addFacet(collectedFacets[i][0], collectedFacets[i][1]);
                }

                treeQuery.q = "*";
                treeQuery.limit = 0;

                // sorting of facet values
                if (scope.hierarchyFacets.length > 0) {
                    treeQuery.sf = scope.hierarchyFacets[node.depth];
                } else if (scope.wildcardFacet && collectedFacets.length > 0) {
                    var lastFacet = collectedFacets[0][0];
                    var lvl = parseInt(lastFacet[lastFacet.length-1]) + 1;
                    treeQuery.sf = lastFacet.substr(0, lastFacet.length-1) + lvl;
                }

                Entity.query(treeQuery.toFlatObject(), function(response) {

                    if (!response.facets) {
                        console.error('[con10t_tree.js] No facets in response because of missing user rights or wrong facet query.');
                        return false;
                    }

                    for (var i = 0; i < response.facets.length; i++) {

                        var currentResultFacet = response.facets[i];

                        console.log(currentResultFacet)
                        // try to find custom hierarchy-facet or wildcard
                        if ((scope.hierarchyFacets.length > 0 && currentResultFacet.name == (scope.hierarchyFacets[node.depth]))
                                || (scope.wildcardFacet && currentResultFacet.name.indexOf(scope.wildcardFacet) > -1)) {

                            console.log(currentResultFacet)

                            for (var j = 0; j < currentResultFacet.values.length; j++) {
                                var value = currentResultFacet.values[j].value;
                                var child = {
                                    name: value,
                                    depth: node.depth + 1,
                                    children: [],
                                    facet: [currentResultFacet.name, value],
                                    parent: node,
                                    id: node.id + "_" + j
                                };
                                node.children.push(child);
                            }
                        }
                    }
                    if (node.children == 0) {
                        node.isLeaf = true;
                    }
                    scope.isShown[node.id] = true;
                });
            };

            scope.collectAllFacets = function(node) {
                var result = [];
                if (node.parent != null) {
                    result.push(node.facet);
                    result = result.concat(this.collectAllFacets(node.parent));
                    return result;
                }
                return result;
            };

            scope.toggleCollapse = function(node) {
                scope.isShown[node.id] = !scope.isShown[node.id];
                if (scope.isShown[node.id]) {
                    this.getNodeChildren(node);
                }
            };
            scope.checkIfShown = function(node) {
                return scope.isShown[node.id]; // at first load -> undefined, so it gets hidden but: ugly?
            };

            scope.closeAll = function() {
                for (var key in scope.isShown)
                    scope.isShown[key] = false;
            };

            scope.startFacetedSearch = function(node) {
                var facets = this.collectAllFacets(node);

                facets = facets.concat(scope.staticFacets);

                var url = "search/?q=*";

                for (var i = 0; i < facets.length; i++) {
                    url += "&fq=" + facets[i][0] + ':"' + facets[i][1] + '"';
                }

                $location.url(url);
            };

            scope.toggleCollapse(scope.treeRoot[0]);

        }
    }
}]);
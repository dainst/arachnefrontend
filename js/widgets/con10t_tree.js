'use strict';

/* Widget directives */
angular.module('arachne.widgets.directives')

/**
 * @author: Sebastian Cuy
 */
    .directive('con10tTree', ['Query', 'Entity', function (Query, Entity) {
        return {
            restrict: 'E',
            templateUrl: 'js/widgets/con10t-tree.html',
            scope: {},
            link: function (scope, element, attrs) {
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

                var collectAllFacets = function (node) {
                    var result = [];
                    if (node.parent != null) {
                        result.push(node.facet);
                        result = result.concat(collectAllFacets(node.parent));
                        return result;
                    }
                    return result;
                };

                var retrieveFacetValues = function (node) {

                    var treeQuery = new Query();
                    var len = scope.staticFacets.length;

                    for (var i = 0; i < len; i++) {
                        treeQuery = treeQuery.addFacet(scope.staticFacets[i][0], scope.staticFacets[i][1]);
                    }

                    var collectedFacets = collectAllFacets(node);

                    len = collectedFacets.length;

                    for (var i = 0; i < len; i++) {
                        treeQuery = treeQuery.addFacet(collectedFacets[i][0], collectedFacets[i][1]);
                    }

                    treeQuery.q = "*";
                    treeQuery.limit = 0;

                    // sorting of facet values
                    var currentFacet = null;
                    if (scope.hierarchyFacets.length > 0) {
                        currentFacet = scope.hierarchyFacets[node.depth];
                    } else if (scope.wildcardFacet && collectedFacets.length > 0) {
                        var lastFacet = collectedFacets[0][0];
                        var lvl = parseInt(lastFacet[lastFacet.length - 1]) + 1;
                        currentFacet = lastFacet.substr(0, lastFacet.length - 1) + lvl;
                    }
                    treeQuery.sf = currentFacet;
                    treeQuery.facet = currentFacet;

                    // set offset if there are already children
                    if (node.children.length > 0) {
                        treeQuery.fo = node.children.length;
                    }

                    Entity.query(treeQuery.toFlatObject(), function (response) {

                        if (!response.facets) {
                            // Missing user rights or wrong facet query
                            return false;
                        }

                        for (var i = 0; i < response.facets.length; i++) {

                            var currentResultFacet = response.facets[i];

                            // try to find custom hierarchy-facet or wildcard
                            if ((scope.hierarchyFacets.length > 0 && currentResultFacet.name == (scope.hierarchyFacets[node.depth]))
                                || (scope.wildcardFacet && currentResultFacet.name.indexOf(scope.wildcardFacet) > -1)) {

                                var len = currentResultFacet.values.length,
                                    value;

                                node.hasMore = true;
                                if (len < treeQuery.fl) {
                                    node.hasMore = false;
                                }

                                for (var j = 0; j < len; j++) {

                                    value = currentResultFacet.values[j].value;
                                    node.children.push({
                                        name: value,
                                        depth: node.depth + 1,
                                        children: [],
                                        facet: [currentResultFacet.name, value],
                                        parent: node,
                                        id: node.id + "_" + j,
                                        count: currentResultFacet.values[j].count
                                    });
                                }
                            }
                        }
                        if (node.children === 0) {
                            node.isLeaf = true;
                        }
                        scope.isShown[node.id] = true;
                    });

                };

                scope.getNodeChildren = function (node) {

                    if (node.children != 0) {
                        return;
                    }

                    retrieveFacetValues(node);

                };

                scope.toggleCollapse = function (node) {
                    scope.isShown[node.id] = !scope.isShown[node.id];
                    if (scope.isShown[node.id]) {
                        this.getNodeChildren(node);
                    }
                };
                scope.checkIfShown = function (node) {
                    return scope.isShown[node.id]; // at first load -> undefined, so it gets hidden but: ugly?
                };

                scope.closeAll = function () {
                    for (var key in scope.isShown)
                        scope.isShown[key] = false;
                };

                scope.loadMoreValues = function (node) {
                    retrieveFacetValues(node);
                };

                scope.startFacetedSearch = function (node) {
                    var facets = collectAllFacets(node);

                    facets = facets.concat(scope.staticFacets);

                    var url = "search?q=",
                        len = facets.length;

                    for (var i = 0; i < len; i++) {
                        url += "&fq=" + facets[i][0] + ':"' + facets[i][1] + '"';
                    }
                    return url;
                };

                scope.toggleCollapse(scope.treeRoot[0]);

            }
        }
    }]);
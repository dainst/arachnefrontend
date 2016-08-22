'use strict';

angular.module('arachne.directives')

    .directive('arFacetBrowser', ['Entity', function(Entity) {
        return {

            scope: {query: '=', facetName: '@', contextSize: '='},
            templateUrl: 'partials/directives/ar-facet-browser.html',

            link: function (scope, element, attrs) {

                scope.entities = [];
                scope.facetValues = [];
                scope.facetQueries = [];

                Entity.query(scope.query.toFlatObject(), function (data) {
                    scope.contextSize = data.size;
                    if (data.facets) {
                        for (var i = 0; i < data.facets.length; i++) {
                            if (scope.facetName == data.facets[i].name) {
                                scope.facetValues = data.facets[i].values;
                                for (var k = 0; k < scope.facetValues.length; k++) {
                                    scope.facetQueries[k] = scope.query.addFacet(scope.facetName, scope.facetValues[k].value);
                                    // ugly exception for sorting book pages when showing contexts of a book
                                    if (scope.facetValues[k].value == 'Buchseiten' && scope.query.q.lastIndexOf('connectedEntities', 0) === 0) {
                                        scope.facetQueries[k] = scope.facetQueries[k].setParam('sort', 'subtitle');
                                    }
                                }
                            }
                        }
                    }
                });

                scope.loadEntities = function (facetValueNo) {
                    var facetQuery = scope.facetQueries[facetValueNo];
                    facetQuery.limit = 100;
                    Entity.query(facetQuery.toFlatObject(), function (data) {
                        scope.entities[facetValueNo] = data.entities;
                    });
                };

            }

        }
    }]);
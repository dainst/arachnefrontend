'use strict';

angular.module('arachne.services')

/**
 * Service for loading facets and facet values
 *
 * @author Patrick Jominet
 */
    .factory('indexService', ['$filter', 'Entity', '$http', 'Query', '$q',
        function ($filter, Entity, $http, Query, $q) {

            return {
                /**
                 * Load facets according to category asynchronously
                 *
                 * @param category for which to get the facets
                 */
                loadFacetsAsync: function (category) {
                    var deferred = $q.defer();
                    var currentCategoryQuery = new Query().addFacet("facet_kategorie", category);
                    currentCategoryQuery.q = "*";
                    Entity.query(currentCategoryQuery.toFlatObject(), function (response) {
                        // get all facets except facet_geo
                        var filteredFacets = response.facets.filter(function (facet) {
                            return facet.name !== "facet_geo"
                        });

                        // sort facets alphabetically
                        filteredFacets = filteredFacets.sort(function (a, b) {
                            if ($filter('transl8')(a.name).toLowerCase() < $filter('transl8')(b.name).toLowerCase()) return -1;
                            if ($filter('transl8')(a.name).toLowerCase() > $filter('transl8')(b.name).toLowerCase()) return 1;
                            return 0;
                        });

                        deferred.resolve(filteredFacets);
                    });
                    return deferred.promise
                },

                /**
                 * Load facet values according to params given in the url
                 *
                 * @param url from which to get the params
                 */
                loadFacetValuesAsync: function (url) {
                    var deferred = $q.defer();
                    $http.get(url).then(function (result) {
                        // get only non empty values
                        var preprocessedValues = result.data.facetValues.filter(function (value) {
                            return value.trim() !== ""
                        });
                        // trim all remaining whitespace from facet values
                        preprocessedValues = preprocessedValues.map(function (value) {
                            return value.trim();
                        });
                        // Filtering duplicates
                        var temp = preprocessedValues.filter(function (value, index, self) {
                            return index === self.indexOf(value);
                        });
                        // sort facet values alphabetically
                        preprocessedValues = temp.sort(function (a, b) {
                            if (a.toLowerCase() < b.toLowerCase()) return -1;
                            if (a.toLowerCase() > b.toLowerCase()) return 1;
                            return 0;
                        });

                        deferred.resolve(preprocessedValues);
                    });
                    return deferred.promise;
                }
            }
        }]);
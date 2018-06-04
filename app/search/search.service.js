'use strict';

angular.module('arachne.services')

/**
 * Singleton service for search access.
 * Automatically parses the query parameters in the current location
 * and caches query results.
 *
 * @author: Sebastian Cuy
 * @author: Patrick Jominet
 */
    .factory('searchService', ['$location', 'Entity', '$rootScope', 'Query', '$q', 'searchScope',
        function ($location, Entity, $rootScope, Query, $q, searchScope) {

            // the currently active result
            var _currentResult = { entities: [] };
            // ?
            var _currentQuery = Query.fromSearch($location.search());
            // save the currently active request in order to prevent
            // issueing the same request many times
            var _currentRequest = false;
            var CHUNK_SIZE = 50;

            /**
             * retrieve a chunk from the current search result
             *
             * checks if the requested chunk is cached, otherwise
             * a new query is sent to the backend
             *
             * @param offset: the position from where on to get the chunk
             * @return { Promise<entities> }
             **/
            function retrieveChunk(offset) {

                searchScope.dirty = false;
                if (!_currentQuery.q)
                    _currentQuery.q = "*";
                var query = _currentQuery.setParam('offset', offset);

                // check if we are already waiting for a result
                if (_currentRequest && _currentRequest.query.toString() === query.toString()) {
                    return _currentRequest.request.$promise;
                }

                // chunk needs to be retrieved
                return performAndParseRequest(offset, query);
            }

            /**
             * Retrieves a chunk via http.
             *
             * @param offset: the position from where on to get the next chunk
             * @param query: query on which the search should be performed
             *
             * @return functions to be called on the retrieved chunk
             */
            function performAndParseRequest(offset, query) {

                if (query.q === "null" || query.q === undefined) {
                    query.q = "*";
                }

                _currentRequest = {
                    query: query,
                    request: null
                };

                var finalQuery = query.extend(searchScope.currentScopeData());
                _currentRequest.request = Entity.query(finalQuery.toFlatObject());
                return _currentRequest.request.$promise.then(function(data) {
                    _currentRequest = false;
                    _currentResult.size = data.size;
                    _currentResult.facets = data.facets || [];
                    _currentResult.entities = data.entities || [];
                    return _currentResult.entities;
                }, function(response) {
                    console.warn("error", response);
                });
            }

            return {

                /**
                 * Generates a new query from the location
                 */
                initQuery: function() {

                    var newQuery = Query.fromSearch($location.search());

                    if (!angular.equals(newQuery.toFlatObject(), _currentQuery.toFlatObject())) {
                        _currentResult = {entities: []};
                    }
                    _currentQuery = newQuery;
                    _currentRequest = false;
                },

                /**
                 * get a single entity from the current result
                 *
                 * @param resultIndex
                 * @returns {*}
                 */
                getEntity: function(resultIndex) {
                    var query = _currentQuery.setParam('offset', resultIndex - 1);
                    return Entity.query(query).$promise.then(function(data) {
                        return data.entities[0];
                    });
                },

                /**
                 * get all current facets
                 *
                 * @returns _currentResult with an appended array containing all facets
                 */
                getFacets: function () {
                    return _currentResult.facets;
                },

                /**
                 * get a facet by name
                 *
                 * @param name to get by
                 * @returns the facet with field 'name' equal to param name
                 * or null if none such facet is present in the current result
                 */
                getFacet: function (name) {
                    var result = null;
                    if (_currentResult.facets) {
                        for (var i = 0; i < _currentResult.facets.length; i++) {
                            if (_currentResult.facets[i].name === name) {
                                result = _currentResult.facets[i];
                                break;
                            }
                        }
                    }
                    return result;
                },


                /**
                 * get a value from facet.values by value
                 *
                 * @param value to get by
                 * @returns the facet.values field 'value' equal to param name
                 * or null if none such value is present in the current facets
                 */
                getFacetValue: function (value) {
                    var result = null;
                    if (_currentResult.facets) {
                        for (var singleFacet in _currentResult.facets) {
                            for (var singleValue in singleFacet.values) {
                                if (singleValue.value === value) {
                                    result = singleValue;
                                    break;
                                }
                            }
                        }
                    }
                    return result;
                },

                /**
                 * retrieve more facet values for the given facet
                 *
                 * @param facet to load more values from
                 * @returns a promise that resolves to true
                 * if still more values were available
                 * and resolves to false otherwise
                 */
                loadMoreFacetValues: function (facet) {
                    var query = angular.extend({limit: 0}, _currentQuery.toFlatObject());
                    query.fo = facet.values.length;
                    query.facet = facet.name;
                    if (!query.q) query.q = "*";
                    var deferred = $q.defer();
                    Entity.query(query, function (data) {
                        if (data.facets && data.facets.length && data.facets[0].values.length) {
                            facet.values = facet.values.concat(data.facets[0].values);
                            if (data.facets[0].values.length < query.fl) deferred.resolve(false);
                            else deferred.resolve(true);
                        } else {
                            deferred.resolve(false);
                        }
                    }, function (data) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },

                /**
                 * get the total number of facet values for a given facet
                 *
                 * @param facet to count the values from
                 * @returns number of facet.values in one given facet
                 */
                getFacetValueSize: function (facet) {
                    var count = 0;
                    if (facet.values) {
                        for (var singleValue in facet.values) {
                            count++;
                        }
                    }
                    return count;
                },

                /**
                 * get current results size
                 *
                 * @returns {*}
                 */
                getSize: function () {
                    console.log("getSize", _currentResult.size);
                    return _currentResult.size;
                },

                /**
                 * get current page as defined by the query's offset
                 *
                 * @returns {Promise.<entities>}
                 */
                getCurrentPage: function () {
                    var offset = _currentQuery.offset;
                    if (angular.isUndefined(offset))
                        offset = 0;
                    return retrieveChunk(offset);
                },

                /**
                 * get current query
                 */
                currentQuery: function () {
                    return _currentQuery;
                }
            }
        }]);

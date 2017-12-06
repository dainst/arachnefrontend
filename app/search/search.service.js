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

            // ?
            var _result = {entities: []};
            // ?
            var _currentQuery = Query.fromSearch($location.search());
            // ?
            var _currentRequest = false;
            var CHUNK_SIZE = 50;
            var dirty = false;

            /**
             * Execute search with current query if location is changed
             */
            $rootScope.$on("$locationChangeSuccess", function (event, url, oldUrl) {

                if (!$rootScope.isOnPage(url, ["map", "search"])) {
                    return;
                }

                var newQuery = Query.fromSearch($location.search());

                if (!angular.equals(newQuery.toFlatObject(), _currentQuery.toFlatObject())) {
                    _result = {entities: []};
                }
                _currentQuery = newQuery;
                _currentRequest = false;
            });


            /**
             * get a cached chunk if present
             *
             * @param offset: the position from where on to get the chunk
             * @returns {Array.<*>}
             */
            function getCachedChunk(offset) {
                var limit = parseInt(_currentQuery.limit);
                // entities:
                return _result.entities.slice(offset, offset + limit);
            }

            /**
             * retrieve a chunk from the current search result
             *
             * checks if the requested chunk is cached, otherwise
             * a new query is sent to the backend
             *
             * cancels any previous request
             *
             * @param offset: the position from where on to get the chunk
             * @return { Promise<entities> }
             **/
            function retrieveChunk(offset) {

                var deferred = $q.defer();

                // if cache holds a chunk
                if ((!dirty) && (!searchScope.dirty) && (!angular.isUndefined(_result.entities[offset]))) {
                    deferred.resolve(getCachedChunk(offset));
                } else { // ?
                    searchScope.dirty = false;
                    dirty = false;
                    if (!_currentQuery.setParam('offset', offset).q)
                        _currentQuery.q = "*";
                    var query = _currentQuery.setParam('offset', offset);

                    if (_currentRequest) {

                        // If the offset of the url differs from the offset param
                        if (_currentRequest.query.toString() === query.toString()) {
                            _currentRequest.request.$promise.then(function (data) {
                                deferred.resolve(data.entities);
                            });
                        } else {
                            _currentRequest.request.$cancelRequest();
                        }

                    } else { // chunk needs to be retrieved
                        performAndParseRequest(offset, query, deferred);
                    }
                }

                return deferred.promise;
            }

            /**
             * Retrieves a chunk via http.
             *
             * @param offset: the position from where on to get the next chunk
             * @param query: query on which the search should be performed
             * @param deferred
             *   .resolve() gets called when request was successful
             *   .reject() gets called otherwise
             *
             * @return functions to be called on the retrieved chunk
             */
            function performAndParseRequest(offset, query, deferred) {

                if (query.q === "null" || query.q === undefined)
                    query.q = "*";
                var finalQuery = query.extend(searchScope.currentScopeData());
                //console.log('ask for:\n', finalQuery, searchScope.currentScopeData(), searchScope.currentScopeName());
                _currentRequest = {
                    query: query,
                    request: Entity.query(finalQuery.toFlatObject())
                };

                _currentRequest.request.$promise.then(function (data) {
                    _currentRequest = false;
                    _result.size = data.size;
                    _result.facets = data.facets ? data.facets : [];
                    if (data.size === 0) {
                        deferred.resolve([]);
                    } else {
                        if (data.entities)
                            for (var i = 0; i < data.entities.length; i++) {
                                _result.entities[parseInt(offset) + i] = data.entities[i];
                            }
                    }
                    deferred.resolve(data.entities);
                }, function (response) {
                    console.warn(response);
                    deferred.reject(response);
                });
            }

            return {

                /**
                 * get a single entity from the current result
                 *
                 * @param resultIndex
                 * @returns {*}
                 */
                getEntity: function (resultIndex) {
                    var deferred = $q.defer();

                    if (resultIndex < 1) {
                        deferred.reject();
                        return deferred.promise;
                    }

                    // resultIndex starts at 1, offset and data[] start at 0
                    var offset = Math.floor((resultIndex - 1) / CHUNK_SIZE) * CHUNK_SIZE;

                    return retrieveChunk(offset).then(function (entities) {
                        deferred.resolve(entities[resultIndex - 1 - offset]);
                        return deferred.promise;
                    });

                },

                /**
                 * get all current facets
                 *
                 * @returns _result with an appended array containing all facets
                 */
                getFacets: function () {
                    //console.log(_result.facets);
                    return _result.facets;
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
                    if (_result.facets) {
                        for (var i = 0; i < _result.facets.length; i++) {
                            if (_result.facets[i].name === name) {
                                result = _result.facets[i];
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
                    if (_result.facets) {
                        for (var singleFacet in _result.facets) {
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
                    return _result.size;
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
                },

                /**
                 * To make sure query gets executed in any case
                 * next time getCurrentPage gets called.
                 */
                markDirty: function () {
                    dirty = true;
                    _currentRequest = false;
                }
            }
        }]);
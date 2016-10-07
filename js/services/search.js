'use strict';

angular.module('arachne.services')

/**
 * Singleton service for search access.
 * Automatically parses the query parameters in the current location
 * and caches query results.
 *
 * @author: Sebastian Cuy
 */
.factory('searchService', ['$location', 'Entity', '$rootScope', 'Query', '$q',
function($location, Entity, $rootScope, Query, $q) {

    var dirty = false;
    var _currentQuery = Query.fromSearch($location.search());
    var _result = { entities: [] };
    var _currentRequest = false;
    var CHUNK_SIZE = 50;

    $rootScope.$on("$locationChangeSuccess", function() {

        var newQuery = Query.fromSearch($location.search());
        if (!angular.equals(newQuery.toFlatObject(),_currentQuery.toFlatObject())) {
            _result = { entities: [] };
        }
        _currentQuery = newQuery;

    });

    // retrieve a chunk from the current search result
    // checks if the requested chunk is cached, otherwise
    // a new query is sent to the backend
    // cancels any previous request
    function retrieveChunk(offset) {

        var deferred = $q.defer();

        // chunk is cached
        if ((!dirty) && (!angular.isUndefined(_result.entities[offset]))) {
            var queryLimit = parseFloat(_currentQuery.limit);
            var limit = isNaN(queryLimit) ? CHUNK_SIZE : queryLimit;

            var entities = _result.entities.slice(offset, offset + limit);
            deferred.resolve(entities);
            return deferred.promise;

        // chunk needs to be retrieved
        } else {
            
            dirty = false;
            var query = _currentQuery.setParam('offset', offset).setParam('limit', CHUNK_SIZE);
            if (!query.q) query.q = "*";

            if (_currentRequest) {
                console.log(_currentRequest.query.toString(), query.toString());
                if (_currentRequest.query.toString() == query.toString()) {
                    console.log('returned existing promise');
                    return _currentRequest.request.$promise;
                } else {
                    _currentRequest.request.$cancelRequest();
                    console.log('canceled a request');
                }
            }

            _currentRequest = { query: query, request: Entity.query(query.toFlatObject()) };
            return _currentRequest.request.$promise.then(function(data) {
                _currentRequest = false;
                _result.size = data.size;
                _result.facets = data.facets ? data.facets : [];
                if (data.size == 0) {
                    deferred.resolve([]);
                } else {
                    if(data.entities) for (var i = 0; i < data.entities.length; i++) {
                        _result.entities[parseInt(offset)+i] = data.entities[i];
                    }
                }
                deferred.resolve(data.entities);
                return deferred.promise;
            }, function(response) {
                deferred.reject(response);
                return deferred.promise;
            });
        }

    }

    return {

        // get a single entity from the current result
        getEntity: function(resultIndex) {

            var deferred = $q.defer();

            if (resultIndex < 1) {
                deferred.reject();
                return deferred.promise;
            }

            // resultIndex starts at 1, offset and data[] start at 0
            var offset = Math.floor((resultIndex-1) / CHUNK_SIZE) * CHUNK_SIZE;

            return retrieveChunk(offset).then(function(data) {
                deferred.resolve(data[resultIndex-1 - offset]);
                return deferred.promise;
            });

        },

        // get current facets
        getFacets: function() {
            return _result.facets;
        },

        // return the facet with field .name equal to name or null
        // if none such facet is present in the current result
        getFacet: function(name) {
            var result = null;
            if (_result.facets) {
                for (var i = 0; i < _result.facets.length; i++) {
                    if (_result.facets[i].name ==  name) {
                        result = _result.facets[i];
                        break;
                    }
                }
            }
            return result;
        },

        // retrieve more facet values for the given facet
        // returns a promise that resolves to true if more values
        // were present and resolves to false otherwise
        loadMoreFacetValues: function(facet) {
            var query = angular.extend({limit:0},_currentQuery.toFlatObject());
            query.fo = facet.values.length;
            query.facet = facet.name;
            if (!query.q) query.q = "*";
            var deferred = $q.defer();
            Entity.query(query, function(data) {
                if (data.facets && data.facets.length && data.facets[0].values.length) {
                    facet.values = facet.values.concat(data.facets[0].values);
                    if (data.facets[0].values.length < query.fl) deferred.resolve(false);
                    else deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            }, function(data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },

        // get current results size
        getSize: function() {
            return _result.size;
        },

        // get current page as defined by the query's offset
        getCurrentPage: function() {
            var offset = _currentQuery.offset;
            if (angular.isUndefined(offset)) offset = 0;
            return retrieveChunk(offset);
        },

        // get current query
        currentQuery: function() {
            return _currentQuery;
        },

        /**
         * To make sure query gets executed in any case
         * next time getCurrentPage gets called.
         */
        markDirty: function() {
            dirty = true;
        }
    }
}]);
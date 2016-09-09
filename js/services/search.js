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
    var CHUNK_SIZE = 50;
    var chunkPromise = false;

    $rootScope.$on("$locationChangeSuccess", function() {

        var newQuery = Query.fromSearch($location.search());
        if (!angular.equals(newQuery.toFlatObject(),_currentQuery.toFlatObject())) {
            _result = { entities: [] };
        }
        _currentQuery = newQuery;
    });

    // wait for other retrieve operations to be finished
    // and retrieve a chunk from the current search result
    function retrieveChunkDeferred(offset) {
        if (chunkPromise) {
            chunkPromise = chunkPromise.then(function(data) {
                return retrieveChunk(offset);
            });
        } else {
            chunkPromise = retrieveChunk(offset);
        }
        return chunkPromise;
    }

    // retrieve a chunk from the current search result
    // checks if the requested chunk is cached, otherwise
    // a new query is sent to the backend
    function retrieveChunk(offset) {

        var deferred = $q.defer();

        // chunk is cached
        if ((!dirty)&&(!angular.isUndefined(_result.entities[offset]))) {
            var queryLimit = parseFloat(_currentQuery.limit);
            var limit = isNaN(queryLimit) ? CHUNK_SIZE : queryLimit;

            var entities = _result.entities.slice(offset, offset + limit);
            chunkPromise = false;
            deferred.resolve(entities);
            return deferred.promise;
            // chunk needs to be retrieved
        } else {
            dirty=false;
            var query = angular.extend({offset:offset,limit:CHUNK_SIZE},_currentQuery.toFlatObject());
            if (!query.q) query.q = "*";
            var entities = Entity.query(query);
            return entities.$promise.then(function(data) {
                _result.size = data.size;
                _result.facets = data.facets ? data.facets : [];
                if (data.size == 0) {
                    deferred.resolve([]);
                } else {
                    if(data.entities) for (var i = 0; i < data.entities.length; i++) {
                        _result.entities[parseInt(offset)+i] = data.entities[i];
                    }
                }
                chunkPromise = false;
                deferred.resolve(data.entities);
                return deferred.promise;
            }, function(response) {
                chunkPromise = false;
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

            return retrieveChunkDeferred(offset).then(function(data) {
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
            return retrieveChunkDeferred(offset);
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
            dirty=true;
        }
    }
}]);
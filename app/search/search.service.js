'use strict';

angular.module('arachne.services')

/**
 * Singleton service for search access.
 * Automatically parses the query parameters in the current location
 * and caches query results.
 *
 * @author: Sebastian Cuy
 */
.factory('searchService', ['$location', 'Entity', '$rootScope', 'Query', '$q', 'searchScope',
function($location, Entity, $rootScope, Query, $q, searchScope) {

    var dirty = false;

    var _currentQuery = Query.fromSearch($location.search());

	/**
	 * @type {{entities: Array}}
	 * @private
	 */
	var _result = { entities: [] };
    var _currentRequest = false;
    var CHUNK_SIZE = 50;

    $rootScope.$on("$locationChangeSuccess", function() {

        var newQuery = Query.fromSearch($location.search());

        if (!angular.equals(newQuery.toFlatObject(),_currentQuery.toFlatObject())) {
            _result = { entities: [] };
        }
        _currentQuery = newQuery;
        _currentRequest = false;
    });



    function getCachedChunk(offset) {
        var limit = parseFloat(_currentQuery.limit);
        var entities = _result.entities.slice(offset, offset + limit);
        return entities;
    }

    /** retrieve a chunk from the current search result
     * checks if the requested chunk is cached, otherwise
     * a new query is sent to the backend
     * cancels any previous request
     * 
     * @return { Promise<entities> }
     **/
    function retrieveChunk(offset) {

        var deferred = $q.defer();

        if ((!dirty) && (!angular.isUndefined(_result.entities[offset]))) {
            deferred.resolve(getCachedChunk(offset));
        } else {
            dirty = false;
            var query = _currentQuery.setParam('offset', offset);
            if (!query.q) query.q = "*";

            if (_currentRequest) {

                // If the offset of the url differs from the offset param
                if (_currentRequest.query.toString() == query.toString()) {
                    _currentRequest.request.$promise.then(function(data){deferred.resolve(data.entities);});
                } else {
                    _currentRequest.request.$cancelRequest();
                }

            } // chunk needs to be retrieved 
            else {
                performAndParseRequest(offset,query,deferred);  
            }
        }

        return deferred.promise;
    }

    /**
     * Retrieves a chunk via http.
     * 
     * @param deferred
     *   .resolve() gets called when request was succesful
     *   .reject() gets called otherwise 
     */
    function performAndParseRequest(offset,query,deferred) {

        if(query.q === "null" || typeof query.q === "undefined")
            query.q = "*";
        var finalQuery = query.extend(searchScope.currentScopeData());
        //console.log('ask for', finalQuery, searchScope.currentScopeData());
        _currentRequest = {
            query: query,
            request: Entity.query(finalQuery.toFlatObject())
        };

        _currentRequest.request.$promise.then(function(data) {
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
        }, function(response) {
            console.warn(response)
            deferred.reject(response);
        });
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

            return retrieveChunk(offset).then(function(entities) {
                deferred.resolve(entities[resultIndex-1 - offset]);
                return deferred.promise;
            });

        },

        // get current facets
        getFacets: function() {
            //console.log(_result.facets);
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
            _currentRequest = false;
        }
    }
}]);
'use strict';

angular.module('arachne.services')

/**
 * represents a search query
 * handles conversion between string representation for frontend URLs
 * and flat object representation for backend requests
 *
 * @author: Sebastian Cuy
 */
.factory('Query', function() {

    function Query() {
        this.facets = [];
        this.offset = 0;
        this.limit = 50;
    }

    Query.prototype = {

        // constructs a new query object from this query
        // and adds or replaces a parameter, returns the new query
        setParam: function(key,value) {
            var newQuery = angular.copy(this);
            newQuery[key] = value;
            return newQuery;
        },

        // constructs a new query object from this query
        // and removes a parameter, returns the new query
        removeParam: function(key) {
            var newQuery = angular.copy(this);
            delete newQuery[key];
            return newQuery;
        },

        // constructs a new query object from this query
        // and removes parameters, returns the new query
        removeParams: function(keys) {
            var newQuery = angular.copy(this);
            for (var i = 0; i < keys.length; i++) {
                delete newQuery[keys[i]];
            }
            return newQuery;
        },

        // return a copy of param, always return an array, even
        // if it has one or zero elements
        getArrayParam: function(key) {
            var value = this[key];

            if (angular.isArray(value)) {
                return angular.copy(value);
            } else if (value !== undefined) {
                return [angular.copy(value)];
            } else {
                return [];
            }
        },

        // constructs a new query object from this query
        // and adds an additional facet, returns the new query
        addFacet: function(facetName,facetValue) {
            var newQuery = angular.copy(this);
            newQuery.facets.push({key:facetName, value:facetValue});
            return newQuery;
        },

        // constructs a new query object from this query
        // and removes a facet, returns the new query
        removeFacet: function(facetName) {
            var newQuery = angular.copy(this);
            newQuery.facets = newQuery.facets.filter(function(facet) {
                return facet.key !== facetName;
            });
            return newQuery;
        },

        // check if query has any particular facet filter attached
        hasFacet: function(facetName) {
            return this.facets.some(function(facet) {
                return (facet.key == facetName);
            });
        },

        // check if query has any facet filters attached
        hasFacets: function() {
            return this.facets.length > 0;
        },

        // returns a representation of this query as GET parameters
        // If a paramter is given as an array, mutiple GET-Paramters with
        // the same name are constructed (conforming to $location)
        toString: function() {

            var params = [];
            for(var key in this) {
                if (key == 'facets') {
                    for(var i in this.facets) {
                        var facetString = this.facets[i].key + ":\"" + this.facets[i].value + "\"";
                        params.push("fq=" + encodeURIComponent(facetString));
                    }
                } else if (angular.isString(this[key]) || angular.isNumber(this[key])) {
                    if(!(key == 'limit') && (this[key] || key == 'resultIndex')) {
                        params.push(key + "=" + encodeURIComponent(this[key]));
                    }
                } else if (angular.isArray(this[key])) {
                    for (var i = 0; i < this[key].length; i++) {
                        params.push(key + "=" + encodeURIComponent(this[key][i]));
                    }
                }
            }

            if (params.length > 0) {
                return "?" + params.join("&");
            } else {
                return "";
            }

        },

        // return a representation of this query as a flat object
        // that can be passed as a params object to $resource and $http
        toFlatObject: function() {
            var object = {};
            var queries = [];
            for(var key in this) {
                if (key == 'facets') {
                    object.fq = [];
                    for(var i in this.facets) {
                        var facetString = this.facets[i].key + ":\"" + this.facets[i].value + "\"";
                        object.fq.push(facetString);
                    }
                } else if (key == 'restrict') {
                    queries.push("_exists_:" + this[key]);
                } else if (key == 'catalogIds') {
                    queries.push("catalogIds:" + this[key]);
                } else if (key == 'q') {
                    queries.push(this[key]);
                } else if (['fl','limit','sort','desc','ghprec','bbox'].indexOf(key) != -1) {
                    object[key] = this[key];
                }
            }
            object.q = queries.join(' AND ');
            return object;
        }

    };

    // factory for building query from angular search object
    Query.fromSearch = function(search) {
        var newQuery = new Query();
        for(var key in search) {
            if (key == 'fq') {
                if (angular.isString(search['fq'])) {
                    var facet = search['fq'].split(':');
                    if (facet.length == 2)
                        newQuery.facets.push({key:facet[0], value: facet[1].substr(1,facet[1].length-2)});
                } else if (angular.isArray(search['fq'])) {
                    search['fq'].forEach(function(facetString) {
                        var facet = facetString.split(':');
                        newQuery.facets.push({key:facet[0], value: facet[1].substr(1,facet[1].length-2)});
                    })
                }
            } else {
                newQuery[key] = search[key];
            }
        }
        return newQuery;
    };

    return Query;

});
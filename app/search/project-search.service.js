'use strict';

angular.module('arachne.services')

/**
 *
 * @author: Philipp Franck
 *
 *

 *
 */
	.factory('projectSearchService', ['$location', '$rootScope', 'Query', '$http', '$stateParams',
		function($location, $rootScope, Query, $http, $stateParams) {

			var currentScope = null;

			var scopes = {}


			var projectSearchService = {

				/**
				 * get the name of current search scope (=project)
				 * @returns {*}
				 */
				get currentScope() {
					currentScope =
						(typeof $stateParams.title === "undefined" || $stateParams.title === '') ?
							null :
							$stateParams.title;
					return currentScope;
				},

				get currentSearchPath() {
					return (projectSearchService.currentScope === null) ? '' : 'project/' + projectSearchService.currentScope + '/';
				},

				/**
				 * takes a query object and overrides it's parts by given project specific scope query
				 * @param query
				 */
				overrideQueryWithProjectScope: function(query) {
					if (typeof scopes[this.currentScope] === "undefined") {
						console.log('unregistered scope >>', this.currentScope);

						return;
					}

					console.log('overwrite query with >>', this.currentScope, '<< properties');

					console.log(query);
					angular.forEach(scopes[this.currentScope], function(value, key) {
						if (angular.isArray(value)) {
							query[key] = query[key].concat(value);
						} else {
							query[key] = value;
						}
					});
					console.log(query);

				},

				scopes: {},

				isReady: false,
				onInitialized: function(){console.log("!")}


			};


			$http.get('con10t/search-scopes.json').then(function(response) {
				console.log('GOT', response);
				scopes = response.data;
				projectSearchService.isReady = true;
				projectSearchService.onInitialized();
			});


			return projectSearchService;

		}]
	)

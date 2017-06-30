'use strict';

angular.module('arachne.services')

/**
 *
 * @author: Philipp Franck
 *
 *

 *
 */
	.factory('projectSearchService', ['$location', '$rootScope', 'Query', '$http', '$stateParams', 'language',
		function($location, $rootScope, Query, $http, $stateParams, language) {

			var currentScopeName = null;

			var scopes = {}; // scope data (from search-scopes.json, necessarily present when isReady)
	
			var scopeTitles = {}; // scope titles (from content.json, not necessarily present when isReady)


			function getScopeTitle(scopeName) {

				function getLocalized(set) {
					var lang = language.currentLanguage();
					if (typeof set[lang] !== "undefined") {
						return set[lang]
					} else {
						return set[Object.keys(set)[0]];
					}
				}

				// if scopeTitles not built yet return name
				if (Object.keys(scopeTitles).length === 0) {
					return scopeName;
				}

				return (typeof scopeTitles[scopeName] !== "undefined") ?
					getLocalized(scopeTitles[scopeName]) :
					scopeName;

			}


			var projectSearchService = {

				isReady: false,
				onInitialized: function(){console.log("!")},

				/**
				 * get the name of current search scope (=project)
				 * @returns {*}
				 */
				currentScopeName: function() {
					currentScopeName =
						(typeof $stateParams.title === "undefined" || $stateParams.title === '') ?
							null :
							$stateParams.title;
					return currentScopeName;
				},

				currentScopePath: function() {
					return (currentScopeName === null) ? '' : 'project/' + currentScopeName + '/';
				},

				currentScopeTitle: function() {
					return getScopeTitle(currentScopeName);
				},

				currentScopeData: function() {
					if (typeof scopes[currentScopeName] === "undefined") {
						//console.log('unregistered scope >>', projectSearchService.currentScopeName, '<<');
						return {};
					}
					//console.log('scope query >>', projectSearchService.currentScopeName, '<<');
					return scopes[currentScopeName];
				}


			};


			$http.get('con10t/search-scopes.json').then(function(response) {
				scopes = response.data;
				projectSearchService.isReady = true;
				projectSearchService.onInitialized();
			});


			$http.get('con10t/content.json').then(function(response) {
				function flatten(tree, map) {
					tree.map(function(branch) {
						map[branch.id] = branch.title;
						if (typeof branch.children !== "undefined") {
							flatten(branch.children, map);
						}
					});
				}
				flatten([response.data], scopeTitles);
			});


			return projectSearchService;

		}]
	)

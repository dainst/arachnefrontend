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

				function flatten(tree, map) {
					tree.map(function(branch) {
						map[branch.id] = branch.title;
						if (typeof branch.children !== "undefined") {
							flatten(branch.children, map);
						}
					});
				}

				function getLocalized(set) {
					var lang = language.currentLanguage();
					if (typeof set[lang] !== "undefined") {
						return set[lang]
					} else {
						return set[Object.keys(set)[0]];
					}
				}

				// if scopeTitles not built yet, do it
				if (Object.keys(scopeTitles).length === 0) {
					// @ TODO make sure, that content.json get loaded correctly and only once
					$http.get('con10t/content.json').then(function(response) {
						flatten([response.data], scopeTitles);
						getScopeTitle(scopeName)
					});
				}

				return ((typeof scopeTitles[scopeName] !== "undefined") &&
					(typeof scopeTitles[scopeName].de !== "undefined")) ?
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
				get currentScopeName() {
					currentScopeName =
						(typeof $stateParams.title === "undefined" || $stateParams.title === '') ?
							null :
							$stateParams.title;
					return currentScopeName;
				},

				get currentSearchPath() {
					return (projectSearchService.currentScopeName === null) ? '' : 'project/' + projectSearchService.currentScopeName + '/';
				},

				get currentScopeTitle() {
					console.log('get titile', projectSearchService.currentScopeName, scopeTitles)
					return getScopeTitle(projectSearchService.currentScopeName);
				},

				get currentScopeData() {
					if (typeof scopes[projectSearchService.currentScopeName] === "undefined") {
						console.log('unregistered scope >>', projectSearchService.currentScopeName, '<<');
						return {};
					}
					console.log('scope query >>', projectSearchService.currentScopeName, '<<');
					return scopes[projectSearchService.currentScopeName];
				},

				getScope: function getScope() {
					return {
						name: projectSearchService.currentScopeName,
						path: projectSearchService.currentSearchPath,
						title: projectSearchService.currentScopeTitle,
						data: projectSearchService.currentScopeData,
					}
				}


			};


			$http.get('con10t/search-scopes.json').then(function(response) {
				scopes = response.data;
				projectSearchService.isReady = true;
				projectSearchService.onInitialized();
			});


			return projectSearchService;

		}]
	)

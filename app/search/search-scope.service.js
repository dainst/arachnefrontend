'use strict';

angular.module('arachne.services')

/**
 *
 * @author: Philipp Franck
 *
 *

 *
 */
	.factory('searchScope', ['$location', '$rootScope', 'Query', '$http', '$stateParams', 'language', '$state',
		function($location, $rootScope, Query, $http, $stateParams, language, $state) {

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


			var searchScope = {

				loadingPromise: $http.get('con10t/search-scopes.json').then(function(response) {scopes = response.data}),

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

				// returns i.E. project/gipsleipzigsamml
				currentScopePath: function() {
					return (currentScopeName === null) ? '' : 'project/' + currentScopeName + '/';
				},

				// returns i.E. project/gipsleipzigsamml/search
				currentSearchPath: function() {
					var definedSearchPage = $state.current.data.searchPage;
					definedSearchPage = (typeof definedSearchPage !== "undefined") ? definedSearchPage : 'search';
					return searchScope.currentScopePath() + definedSearchPage;
				},

				currentScopeTitle: function() {
					return getScopeTitle(currentScopeName);
				},

				currentScopeData: function() {
					currentScopeName = searchScope.currentScopeName();
					if (typeof scopes[currentScopeName] === "undefined") {
						//console.log('unregistered scope >>', searchScope.currentScopeName, '<<');
						return {};
					}
					//console.log('scope query >>', searchScope.currentScopeName, '<<');
					return scopes[currentScopeName];
				}


			};


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


			return searchScope;

		}]
	)

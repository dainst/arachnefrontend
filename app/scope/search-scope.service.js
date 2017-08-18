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

	function solveAlias(scopeName) {
		if (scopeName === null) { // unscoped
			return null;
		}
		if (!Object.keys(scopes).length) { // not loaded yet
			return scopeName;
		}
		if ((typeof scopes[scopeName] !== "undefined") && (typeof scopes[scopeName].alias !== "undefined")) {
			//console.log('scope ' + scopeName + ' is alias of ' + scopes[scopeName].alias);
			$stateParams.title = scopes[scopeName].alias;
			return solveAlias(scopes[scopeName].alias);
		}
		return scopeName;
	}


	var searchScope = {

		loadingPromise: $http.get('con10t/search-scopes.json').then(function(response) {scopes = response.data}),

		dirty: false, // same as in search-service, dublicated to avoid biderectional dependency

		/**
		 * get the name of current search scope (=project)
		 * @returns {*}
		 */
		currentScopeName: function() {
			currentScopeName =
				(typeof $stateParams.title === "undefined" || $stateParams.title === '') ?
					null :
					solveAlias($stateParams.title);

			return currentScopeName;
		},

		// returns i.E. project/gipsleipzigsamml
		currentScopePath: function() {
			searchScope.currentScopeName();
			//console.log(currentScopeName)
			return (currentScopeName === null) ? '' : 'project/' + currentScopeName + '/';
		},

		// returns i.E. project/gipsleipzigsamml/search
		currentSearchPath: function() {
			searchScope.currentScopeName();
			searchScope.currentScopeName();
			var definedSearchPage = $state.current.data.searchPage;
			definedSearchPage = (typeof definedSearchPage !== "undefined") ? definedSearchPage : 'search';
			return searchScope.currentScopePath() + definedSearchPage;
		},

		currentScopeTitle: function() {
			searchScope.currentScopeName();
			return getScopeTitle(currentScopeName);
		},

		currentScopeData: function() {
			searchScope.currentScopeName();
			if (currentScopeName === null) { //scopeless
				return {};
			}
			if (typeof scopes[currentScopeName] === "undefined") { //hopeless
				searchScope.forwardToScopeless();
				return {};
			}
			//console.log('scope query >>', searchScope.currentScopeName, '<<');
			return scopes[currentScopeName];
		},


		getScopeTitle: function(scopeName) {
			return getScopeTitle(scopeName);
		},

		forwardToScopeless: function() {
			// if the search scope is not defined, we forward to normal, scopeless search.
			// it might not be the most elegant solution to put a forwarder inside this class... but actually atm
			// I have no better idea where to put it... feel free to find the right spot
			searchScope.currentScopeName();
			$location.url($location.url().replace('/project/' + currentScopeName, ""));
		},


		scopeSettings: {},

		refresh: function()  {

            var path = searchScope.currentScopePath();
			searchScope.dirty = true;
            searchScope.scopeSettings.name		= searchScope.currentScopeName();
            searchScope.scopeSettings.path 		= path;
            searchScope.scopeSettings.title		= searchScope.currentScopeTitle();
            searchScope.scopeSettings.search 	= function(q) {return searchScope.currentSearchPath() + '?q=' + q;};
            searchScope.scopeSettings.leaveScope= searchScope.forwardToScopeless;
            searchScope.scopeSettings.page		= path.substring(0, path.length -1);

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

		searchScope.refresh();

		document.title = (searchScope.currentScopeTitle() !== null) ? searchScope.currentScopeTitle() + ' |\u00A0' : '';
		document.title += (typeof $state.current.data !== "undefined") ? $state.current.data.pageTitle : '';
	});


	return searchScope;

}])

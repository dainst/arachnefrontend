'use strict';

angular.module('arachne',[
	'ui.bootstrap',
	'ui.bootstrap.tpls',
	'ui.router',
	'ngSanitize',
	'ngResource',
	'ngCookies',
	'ng-showdown',
	'angulartics',
	'angulartics.piwik',
	'relativePathsInPartial',
	'ui.tree',
	'idai.templates',
	'idai.components',
	'arachne.js-templates',
	'arachne.partials-templates',
	'arachne.filters',
	'arachne.resources',
	'arachne.services',
	'arachne.directives',
	'arachne.controllers',
	'arachne.widgets.directives',
	'arachne.widgets.map'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$compileProvider', '$resourceProvider', '$qProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider, $resourceProvider, $qProvider) {

		$locationProvider.html5Mode(true);

        //$qProvider.errorOnUnhandledRejections(false);

		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|blob):/);

		$resourceProvider.defaults.cancellable = true;

		$urlRouterProvider.when('', '/');
		$urlRouterProvider.otherwise('/404');

		var title = "Arachne";


		var loadingPromises = {
			'getSearchScopes': function (searchScope) {
				return searchScope.loadingPromise;
			}
		}

		/**
		 * we want to realize scope-prefixed urls like project/whatever/search as well as /search
		 * and don't want to define all of them double.
		 * since both shall lead to search, not to project in the first case, they are not children in the
		 * sense of ui-router. Also ui-router does not support optional parameters in the urls yet,
		 * and the regex-support in the urls is to limited to realize it like this.
		 * that's why we use a little nice function for that
		 */


		var states = {
			'404':				{ url: '/404', templateUrl: 'app/pages/404.html', data: { pageTitle: 'Arachne | 404' }},
			'welcome':			{ url: '/', templateUrl: 'app/pages/welcome-page.html', data: { pageTitle: title }},
			'catalogs':			{ url: '/catalogs', templateUrl: 'app/catalog/catalogs.html', data: { pageTitle: title }},
			'catalog':			{ url: '/catalog/:id?view', templateUrl: 'app/catalog/catalog.html', data: { pageTitle: title }},
			'catalog.entry':	{ url: '/:entryId?view', templateUrl: 'app/catalog/catalog.html', data: { pageTitle: title }},
			'books':			{ url: '/books/:id?', templateUrl: 'app/entity/entity.html', reloadOnSearch: false, data: { pageTitle: title }},
			'entity':			{ url: '/entity/:id?/:params?', templateUrl: 'app/entity/entity.html', reloadOnSearch: false, data: { pageTitle: title }},


			'entityImages':		{ url: '/entity/:entityId/images', templateUrl: 'app/entity/entity-images.html', data: { pageTitle: title }},
			'entityImage':		{ url: '/entity/:entityId/image/:imageId', templateUrl: 'app/entity/entity-image.html', data: { pageTitle: title }},
			'search':			{ url: '/search?q&fq&view&sort&offset&limit&desc', templateUrl: 'app/search/search.html', data: { pageTitle: title }},
			'categories':		{ url: '/categories', templateUrl: 'app/category/categories.html', data: { pageTitle: title }},
			'category':			{ url: '/category/:category', templateUrl: 'app/category/category.html', data: { pageTitle: title }},

			'map': {
				url: '/map?q&fq',
				templateUrl: 'app/map/map.html',
				data: {
					pageTitle: title,
					searchPage: 'map'
				}
			},

			'gridmap':			{ url: '/gridmap', templateUrl: 'app/map/gridmap.html', data: { pageTitle: title }},
			'3d':				{ url: '/3d', templateUrl: 'app/3d/3d.html', data: { pageTitle: title }},
			'projects':			{ url: '/projects', templateUrl: 'app/pages/projects.html', data: { pageTitle: title }},
			'register':			{ url: '/register', templateUrl: 'app/users/register.html', data: { pageTitle: title }},
			'editUser':			{ url: '/editUser', templateUrl: 'app/users/edit-user.html', data: { pageTitle: title }},
			'contact':			{ url: '/contact', templateUrl: 'app/users/contact.html', data: { pageTitle: title }},
			'dataimport':		{ url: '/admin/dataimport', templateUrl: 'app/pages/dataimport.html', data: { pageTitle: title }},
			'pwdreset':			{ url: '/pwdreset', templateUrl: 'app/users/pwd-reset.html', data: { pageTitle: title }},
			'pwdchange':		{ url: '/pwdchange', templateUrl: 'app/users/pwd-change.html', data: { pageTitle: title }},
			'userActivation':	{ url: '/user/activation/:token', templateUrl: 'app/users/pwd-activation.html', data: { pageTitle: title }},
			'project':			{ url: '/project/:title', templateUrl: 'app/pages/static.html', data: { pageTitle: title }},
			'index':			{ url: '/index?c&fq&fv&group', templateUrl: 'app/facets/index.html', reloadOnSearch: false, data: { pageTitle: title }},
			'info':				{ url: '/info/:title?id', templateUrl: 'app/pages/static.html', data: { pageTitle: title }} // Named it info, not static, to sound not too technical.

		}

		var scoped = {'project': ['search', 'map', 'entity', 'entityImage', 'entityImages']};

		function registerState(state, name) {
			//console.log(name, state);
			$stateProvider.state(name, angular.copy(state));
			angular.forEach(scoped[name] || [], function(child) {
				var newState = angular.copy(states[child]);
				newState.url = state.url + newState.url;
				newState.resolve = loadingPromises;
				registerState(newState, name + '-' + child);
			});
		}
		
		angular.forEach(states, registerState);

	}
])
/**
 * Change <title> after page change
 * Jan G. Wieners
 */
.run(['$rootScope','searchScope', function($rootScope, searchScope) {

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		document.title = (typeof toParams.title !== "undefined") ? searchScope.getScopeTitle(toParams.title) + ' |\u00A0' : '';
		document.title += toState.data.pageTitle;

		searchScope.refresh(); // refresh scopeObject for navbarSearch
	});
}])
.constant('arachneSettings', {
	arachneUrl: 'https://arachne.dainst.org',
	dataserviceUri: "//" + document.location.host + "/data",
	limit: 50,
	facetLimit: 20,
	openFacets : ["facet_image", "facet_kategorie", "facet_bestandsname", "facet_subkategoriebestand"],
	sortableFields : ["entityId", "title", "subtitle"]
})
.constant('componentsSettings', {
	transl8Uri: 'https://arachne.dainst.org/transl8/translation/jsonp?application=arachne4_frontend&application=shared&lang={LANG}',
	searchUri: 'https://arachne.dainst.org/data/suggest?q=',
	mailTo: 'idai.objects@dainst.org'
});

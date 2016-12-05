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
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$compileProvider', '$resourceProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider, $resourceProvider) {

		$locationProvider.html5Mode(true);

		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|blob):/);

		$resourceProvider.defaults.cancellable = true;

		$urlRouterProvider.when('', '/');
		$urlRouterProvider.otherwise('/404');

		var title = "Arachne";

		$stateProvider
			.state('404', { url: '/404', templateUrl: 'app/controllers/404.html', data: { pageTitle: 'Arachne | 404' }})
			.state('start', { url: '/', templateUrl: 'app/controllers/startSite.html', data: { pageTitle: title }})
			.state('catalogs', { url: '/catalogs', templateUrl: 'app/catalog/catalogs.html', data: { pageTitle: title }})
			.state('catalog', { url: '/catalog/:id?view', templateUrl: 'app/catalog/catalog.html', data: { pageTitle: title }})
			.state('catalog.entry', { url: '/:entryId?view', templateUrl: 'app/catalog/catalog.html', data: { pageTitle: title }})
			.state('entity', { url: '/entity/:id?/:params?', templateUrl: 'app/entity/entity.html', reloadOnSearch: false, data: { pageTitle: title }})
			.state('entityImages', { url: '/entity/:entityId/images', templateUrl: 'app/entity/entity_images.html', data: { pageTitle: title }})
			.state('entityImage', { url: '/entity/:entityId/image/:imageId', templateUrl: 'app/entity/entity_image.html', data: { pageTitle: title }})
			.state('search', { url: '/search?q&fq&view&sort&offset&limit&desc', templateUrl: 'app/search/search.html', data: { pageTitle: title }})
            .state('categories', { url: '/categories', templateUrl: 'app/category/categories.html', data: { pageTitle: title }})
			.state('category', { url: '/category/:category', templateUrl: 'app/category/category.html', data: { pageTitle: title }})
			.state('map', { url: '/map?q&fq', templateUrl: 'app/map/map.html', data: { pageTitle: title }})
			.state('gridmap', { url: '/gridmap', templateUrl: 'app/map/gridmap.html', data: { pageTitle: title }})
			.state('3d', { url: '/3d', templateUrl: 'app/controllers/3d.html', data: { pageTitle: title }})
			.state('projects', { url: '/projects', templateUrl: 'app/controllers/projects.html', data: { pageTitle: title }})
			.state('register', { url: '/register', templateUrl: 'app/users/register.html', data: { pageTitle: title }})
			.state('editUser', { url: '/editUser', templateUrl: 'app/users/editUser.html', data: { pageTitle: title }})
			.state('apis', { url: '/apis', templateUrl: 'app/controllers/apis.html', data: { pageTitle: title }})
			.state('contact', { url: '/contact', templateUrl: 'app/users/contact.html', data: { pageTitle: title }})
			.state('dataimport', { url: '/admin/dataimport', templateUrl: 'app/controllers/dataimport.html', data: { pageTitle: title }})
			.state('pwdreset', { url: '/pwdreset', templateUrl: 'app/users/pwdreset.html', data: { pageTitle: title }})
			.state('userActivation', { url: '/user/activation/:token', templateUrl: 'app/users/activation.html', data: { pageTitle: title }})
			.state('project', { url: '/project/:title?q&fq', templateUrl: 'app/controllers/static.html', data: { pageTitle: title }})
			.state('info', { url: '/info/:title?id', templateUrl: 'app/controllers/static.html', data: { pageTitle: title }}); // Named it info, not static, to sound not too technical.
	}
])
/**
 * Change <title> after page change
 * Jan G. Wieners
 */
.run(['$rootScope',function($rootScope) {

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		document.title = toState.data.pageTitle;
	});
}])
.constant('arachneSettings', {
	dataserviceUri: "//" + document.location.host + "/data",
	limit: 50,
	facetLimit: 20,
	openFacets : ["facet_image", "facet_kategorie", "facet_bestandsname", "facet_subkategoriebestand"],
	sortableFields : ["entityId", "title", "subtitle"]
})
.constant('componentsSettings', {
		transl8Uri: "https://arachne.dainst.org/transl8/translation/jsonp?application=arachne4_frontend&application=shared&lang={LANG}&callback=JSON_CALLBACK"
	}
);

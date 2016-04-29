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
	'angulartics.google.analytics',
	'relativePathsInPartial',
	'ui.tree',
	'idai.templates',
	'idai.components',
	'arachne.templates',
	'arachne.filters',
	'arachne.resources',
	'arachne.services',
	'arachne.directives',
	'arachne.controllers',
	'arachne.widgets.directives'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$compileProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {

		$locationProvider.html5Mode(true);

		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|blob):/)

		$urlRouterProvider.when('', '/');
		$urlRouterProvider.otherwise('/404');
		
		var title = "Arachne";
		
		$stateProvider
			.state('404', { url: '/404', templateUrl: 'partials/404.html', data: { pageTitle: 'Arachne | 404' }})
			.state('start', { url: '/', templateUrl: 'partials/startSite.html', data: { pageTitle: title }})
			.state('catalogs', { url: '/catalogs', templateUrl: 'partials/catalogs.html', data: { pageTitle: title }})
			.state('catalog/:id', { url: '/catalog/:id', templateUrl: 'partials/catalog.html', data: { pageTitle: title }})
			.state('entity', { url: '/entity/:id?/:params?', templateUrl: 'partials/entity.html', reloadOnSearch: false, data: { pageTitle: title }})
			.state('entityImages', { url: '/entity/:entityId/images', templateUrl: 'partials/entity_images.html', data: { pageTitle: title }})
			.state('entityImage', { url: '/entity/:entityId/image/:imageId', templateUrl: 'partials/entity_image.html', data: { pageTitle: title }})
			.state('search', { url: '/search?q&fq&view&sort&offset&limit&desc', templateUrl: 'partials/search.html', data: { pageTitle: title }})
			.state('category', { url: '/category/:category', templateUrl: 'partials/category.html', data: { pageTitle: title }})
			.state('map', { url: '/map?q&fq', templateUrl: 'partials/map.html', data: { pageTitle: title }})
			.state('gridmap', { url: '/gridmap', templateUrl: 'partials/gridmap.html', data: { pageTitle: title }})
			.state('3d', { url: '/3d', templateUrl: 'partials/3d.html', data: { pageTitle: title }})
			.state('allCategories', { url: '/allCategories', templateUrl: 'partials/allCategories.html', data: { pageTitle: title }})
			.state('projects', { url: '/projects', templateUrl: 'partials/projects.html', data: { pageTitle: title }})
			.state('register', { url: '/register', templateUrl: 'partials/register.html', data: { pageTitle: title }})
			.state('editUser', { url: '/editUser', templateUrl: 'partials/editUser.html', data: { pageTitle: title }})
			.state('apis', { url: '/apis', templateUrl: 'partials/apis.html', data: { pageTitle: title }})
			.state('contact', { url: '/contact', templateUrl: 'partials/contact.html', data: { pageTitle: title }})
			.state('dataimport', { url: '/admin/dataimport', templateUrl: 'partials/dataimport.html', data: { pageTitle: title }})
			.state('pwdreset', { url: '/pwdreset', templateUrl: 'partials/pwdreset.html', data: { pageTitle: title }})
			.state('userActivation', { url: '/user/activation/:token', templateUrl: 'partials/activation.html', data: { pageTitle: title }})
			.state('project', { url: '/project/:title?q&fq', templateUrl: 'partials/static.html', data: { pageTitle: title }})
			.state('info', { url: '/info/:title?id', templateUrl: 'partials/static.html', data: { pageTitle: title }}); // Named it info, not static, to sound not too technical.
	}
])
/**
 * Change <title> after page change
 * Jan G. Wieners
 */
.run(function($rootScope) {

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		document.title = toState.data.pageTitle;
	});
})
.constant('arachneSettings', {
	dataserviceUri: "http://" + document.location.host + "/data",
	openFacets : ["facet_image", "facet_kategorie", "facet_bestandsname", "facet_subkategoriebestand"],
	sortableFields : ["entityId", "title", "subtitle"]
})
.constant('componentsSettings', {
		transl8Uri: "http://bogusman01.dai-cloud.uni-koeln.de/transl8/translation/jsonp?application=arachne4_frontend&lang={LANG}&callback=JSON_CALLBACK"
	}
)
;

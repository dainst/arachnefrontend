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
		$stateProvider
			.state('404', { url: '/404', templateUrl: 'partials/404.html'})
			.state('start', { url: '/', templateUrl: 'partials/startSite.html'})
			.state('catalogs', { url: '/catalogs', templateUrl: 'partials/catalogs.html'})
			.state('catalog/:id', { url: '/catalog/:id', templateUrl: 'partials/catalog.html'})
			.state('entity', { url: '/entity/:id?/:params?', templateUrl: 'partials/entity.html', reloadOnSearch: false})
			.state('entityImages', { url: '/entity/:entityId/images', templateUrl: 'partials/entity_images.html'})
			.state('entityImage', { url: '/entity/:entityId/image/:imageId', templateUrl: 'partials/entity_image.html'})
			.state('search', { url: '/search?q&fq&view&sort&offset&limit&desc', templateUrl: 'partials/search.html'})
			.state('category', { url: '/category/:category', templateUrl: 'partials/category.html'})	
			.state('map', { url: '/map?q&fq', templateUrl: 'partials/map.html'})
			.state('gridmap', { url: '/gridmap', templateUrl: 'partials/gridmap.html'})
			.state('3d', { url: '/3d', templateUrl: 'partials/3d.html'})
			.state('allCategories', { url: '/allCategories', templateUrl: 'partials/allCategories.html'})
			.state('projects', { url: '/projects', templateUrl: 'partials/projects.html'})
			.state('register', { url: '/register', templateUrl: 'partials/register.html'})
			.state('editUser', { url: '/editUser', templateUrl: 'partials/editUser.html'})
			.state('apis', { url: '/apis', templateUrl: 'partials/apis.html'})
			.state('contact', { url: '/contact', templateUrl: 'partials/contact.html'})
			.state('dataimport', { url: '/admin/dataimport', templateUrl: 'partials/dataimport.html'})
			.state('pwdreset', { url: '/pwdreset', templateUrl: 'partials/pwdreset.html'})
			.state('userActivation', { url: '/user/activation/:token', templateUrl: 'partials/activation.html'})
			.state('project', { url: '/project/:title?q&fq', templateUrl: 'partials/static.html'})
			.state('info', { url: '/info/:title', templateUrl: 'partials/static.html'}); // Named it info, not static, to sound not too technical.
	}
]).constant('arachneSettings', {
		dataserviceUri: "http://" + document.location.host + "/data",
		openFacets : ["facet_image", "facet_kategorie", "facet_bestandsname", "facet_subkategoriebestand"],
		sortableFields : ["entityId", "title", "subtitle"]
})
.constant('componentsSettings', {
		transl8Uri: "http://bogusman01.dai-cloud.uni-koeln.de/transl8/translation/jsonp?application=arachne4_frontend&lang={LANG}&callback=JSON_CALLBACK"
	}
)
;

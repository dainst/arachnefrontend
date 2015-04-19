'use strict';

angular.module('arachne',[
	'ui.bootstrap',
    'ui.utils',
	'ngRoute',
	'ngSanitize',
	'ngResource',
	'ngCookies',
	'angulartics', 
	'angulartics.google.analytics',
	'relativePathsInPartial',
	'ui.tree',
	'arachne.filters',
	'arachne.services',
	'arachne.directives',
	'arachne.controllers',
    'arachne.widgets.directives'
])
.config(['$routeProvider', '$locationProvider', '$compileProvider', function($routeProvider, $locationProvider, $compileProvider) {
	$locationProvider.html5Mode(true);

	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|blob):/)

	$routeProvider
		.when('/', {templateUrl: 'partials/startSite.html'})
		.when('/catalog', {templateUrl: 'partials/catalog.html'})
		.when('/entity/:id?', {templateUrl: 'partials/entity.html'})
		.when('/entity/:entityId/images', {templateUrl: 'partials/entity_images.html'})
		.when('/entity/:entityId/image/:imageId', {templateUrl: 'partials/entity_image.html'})
		.when('/search/:params?', {templateUrl: 'partials/search.html'})
		.when('/category/:params?', {templateUrl: 'partials/category.html'})	
		.when('/map', {templateUrl: 'partials/map.html'})
		.when('/3d', {templateUrl: 'partials/3d.html'})
		.when('/impressum', {templateUrl: 'partials/impressum.html'})
		.when('/datenschutz', {templateUrl: 'partials/datenschutz.html'})
		.when('/allCategories', {templateUrl: 'partials/allCategories.html'})
		.when('/projects', {templateUrl: 'partials/projects.html'})
		.when('/register', {templateUrl: 'partials/register.html'})
		.when('/faq', {templateUrl: 'partials/faq.html'})
		.when('/project/:name', {templateUrl: 'partials/project.html'});
}]).constant('arachneSettings', {
		dataserviceUri: "http://lakota.archaeologie.uni-koeln.de/data",
		serverUri : "http://" + document.location.host + document.getElementById('baseLink').getAttribute("href"),
		openFacets : ["facet_image", "facet_kategorie", "facet_bestandsname", "facet_subkategoriebestand"],
		sortableFields : ["entityId", "title", "subtitle"]
}).run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    	// resetting the default page title for controller changes
    	document.title = "Arachne"
    });
}]);

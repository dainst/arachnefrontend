'use strict';

angular.module('arachne',
	['ui.bootstrap',
	'ngRoute',
	'ngSanitize',
	'ngResource',
	'ngCookies',
	'arachne.filters',
	'arachne.services',
	'arachne.directives',
	'arachne.controllers',
	]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	
	$locationProvider.html5Mode(true);

	$routeProvider
		.when('/', {templateUrl: 'partials/startSite.html'})
		.when('/bookmarks', {templateUrl: 'partials/bookmarks.html'})
		.when('/entity/:id?', {templateUrl: 'partials/entity.html'})
		.when('/entity/:entityId/images', {templateUrl: 'partials/image.html'})
		.when('/search/:params?', {templateUrl: 'partials/search.html'})
		.when('/category/:params?', {templateUrl: 'partials/category.html'})	
		.when('/map', {templateUrl: 'partials/map.html'})
		.when('/3d', {templateUrl: 'partials/3d.html'});
}]).constant('arachneSettings', {
		dataserviceUri : "http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice",
		// dataserviceUri : "http://nighthorse01.dai-cloud.uni-koeln.de/arachnedataservice"
		serverUri : "http://crazyhorse.archaeologie.uni-koeln.de/arachne4"
		//serverUri : "http://nighthorse01.dai-cloud.uni-koeln.de"
});
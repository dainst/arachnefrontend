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
	'leaflet-directive',
	]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	
	$locationProvider.html5Mode(true);

	$routeProvider
		.when('/', {templateUrl: 'partials/startSite.html'})
		.when('/bookmarks', {templateUrl: 'partials/bookmarks.html'})
		.when('/entity/:id?', {templateUrl: 'partials/entity.html'})
		.when('/search/:params?', {templateUrl: 'partials/search.html'});

}]);
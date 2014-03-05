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
		.when('/entity/:id?', {templateUrl: 'partials/entity.html'})
		.when('/search/:params?', {templateUrl: 'partials/search.html'})
		.when('/entity/image/:id?', {templateUrl: 'partials/image.html'});

}]);
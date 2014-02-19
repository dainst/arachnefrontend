'use strict';



var myApp = angular.module("myApp", ['ui.bootstrap']);
// Declare app level module which depends on filters, and services
angular.module('myApp', [
	'ngRoute',
	'ngSanitize',
	'ngResource',
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers'
	]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	
	$locationProvider.html5Mode(true);

	$routeProvider
		.when('/', {templateUrl: 'partials/startSite.html'})
		.when('/entity/:id?', {templateUrl: 'partials/entity.html'})
		.when('/search/:params?', {templateUrl: 'partials/searchTiles.html'});

}]);

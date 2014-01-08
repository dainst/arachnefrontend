'use strict';

angular.module("myApp", ['ui.bootstrap']);
// Declare app level module which depends on filters, and services
angular.module('myApp', [
	'ngRoute',
	'ngSanitize',
	'ngResource',
	'masonry',
	// 'myApp.filters',
	'myApp.services',
	// 'myApp.directives',
	'myApp.controllers'
	]).
config(['$routeProvider',  '$locationProvider', function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$routeProvider
		.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'})
		.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'})
		.when('/search/:params?', {templateUrl: 'partials/search.html'});

}]);




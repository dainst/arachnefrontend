'use strict';

/* Filters */

angular.module('myApp.filters', [])

	.filter('i18n', ['$window', function( $window) {
	    return function (input) {
	    	var trans = $window.translations[input];
	    	if (typeof(trans) == "undefined") return input;
	    	return trans
	        
	    }
	}]);
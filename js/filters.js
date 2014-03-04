'use strict';

/* Filters */

angular.module('arachne.filters', [])

	.filter('i18n', ['$window', function( $window) {
	    return function (input) {
	    	var trans = $window.translations[input];
	    	if (typeof(trans) == "undefined") return input;
	    	return trans
	        
	    }
	}]);
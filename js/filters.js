'use strict';

/* Filters */

angular.module('myApp.filters', []).
	filter('translate', function() {
		
		return function(input) {
			return "Translations[input]";
		}
	}).filter('i18n', ['$window', function( $window) {
	    return function (input) {
	    	var trans = $window.translations[input];
	    	if (typeof(trans) == "undefined") return input;
	    	return trans
	        
	    }
	}]);
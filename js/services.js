'use strict';

/* Services */


angular.module('myApp.services', [])
	.factory('arachneSearch', ['$resource', function($resource) {
			return $resource('http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/search', {}, {
				query: {method:'GET', headers: {'Content-Type': 'application/json'}}
			});
		}
	]);

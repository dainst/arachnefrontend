'use strict';

/* Services */


angular.module('myApp.services', [])
	.factory('arachneSearch', 
		['$resource','$log',
			function($resource) {


				var service = {};

		        var arachneDataService = $resource('http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/search', {}, {query: {
		            isArray: false,
		            method: 'GET',
		            headers: {'Content-Type': 'application/json'}
		        }});

		        service.currentSearch = {};
		        service.executeSearch = function (pQueryParams) {
		        	service.currentSearch.queryParams = pQueryParams;
		            return arachneDataService.query(pQueryParams, function (data) {
		            	service.currentSearch.results = data;
		            });
		        };



				return service;
			
		}])
	.factory('arachneEntity',
		['$resource',
			function($resource){
				return $resource('http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/entity/:id'
				);
			}
		]
	);

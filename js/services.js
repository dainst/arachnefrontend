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
		            	var localStorageReplication = {};
		            	localStorageReplication.results = data;
		            	localStorageReplication.queryParams = pQueryParams;
		            	localStorage.setItem('currentSearch', JSON.stringify(localStorageReplication));
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
	)
	.factory('newsFactory', function($http){
		var factory = {};
		factory.getNews = function() {
				return $http.get('http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/news/de');
			};
		return factory;
	})
	.factory('teaserFactory', function($http){
		var factory = {};
		factory.getTeaser = function() {
				return $http.get('http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/teasers/de');
			};
		return factory;
	});


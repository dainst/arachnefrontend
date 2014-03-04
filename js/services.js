'use strict';

/* Services */

angular.module('arachne.services', [])
	.factory('arachneSearch', 
		['$resource','$log',
			function($resource) {


				var service = {};				
		        //var markers = new L.MarkerClusterGroup();

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
 				service.getMarkers = function(pQueryParams){
		        	service.currentSearch.queryParams = pQueryParams;
		            return arachneDataService.query(pQueryParams, function (data) {
		            	service.currentSearch.results = data;		       			
		            	//service.markers = new L.MarkerClusterGroup();
		            	service.currentSearch.results.markers = new Array();
	

		            	for(var entry in data.facets.facet_geo)
		            	{
		            		var coordsString = entry.substring(entry.indexOf("[", 1)+1, entry.length - 1)
							var coords = coordsString.split(',');
							var title = entry.substring(0, entry.indexOf("[", 1)-1);
							// title += value.link + "'>Objekte zu diesem Ort anzeigen</a>"
							// title = title.replace('#simpleBrowsing', '#search')

							var marker = new Object();
							marker.layer = "locs";
							marker.lat = parseFloat(coords[0]);
                			marker.lng = parseFloat(coords[1]);
                			marker.message = title;                			
							service.currentSearch.results.markers.push(marker)
		            	}    
		    		
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


'use strict';

/* Services */

angular.module('arachne.services', [])
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
 				service.getMarkers = function(pQueryParams){
		        	service.currentSearch.queryParams = pQueryParams;
		            return arachneDataService.query(pQueryParams, function (data) {
		            	service.currentSearch.results = data;		       
		            	service.currentSearch.results.markers = new L.MarkerClusterGroup();

						// title += value.link + "'>Objekte zu diesem Ort anzeigen</a>"
						// title = title.replace('#simpleBrowsing', '#search')

		            	for(var entry in data.facets.facet_geo)
		            	{
		            		var coordsString = entry.substring(entry.indexOf("[", 1)+1, entry.length - 1);
							var coords = coordsString.split(',');
							var title = entry.substring(0, entry.indexOf("[", 1)-1);

							var marker = L.marker(new L.LatLng(coords[0], coords[1]), { title: title });
							marker.bindPopup(title);
							service.currentSearch.results.markers.addLayer(marker);
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
	.factory('sessionService', function($http){
		var service = {};
		service.user = {};
		service.user.username ="hans";





		service.login  = function(loginData) {
			service.user = $http({
				url : 'http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/sessions',
	            isArray: false,
	            method: 'POST',
	            data : loginData,
	            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
	            transformRequest: function(obj) {
			        var str = [];
			        for(var p in obj)
			        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			        return str.join("&");
			    },

	        }).success(function (a,b,c) {
			    	return a;
			    	

			});

		};

		
		return service;
	})
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


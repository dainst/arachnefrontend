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
							//console.log(value.link);

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
	.factory('arachneEntityImg',
		['$resource',
			function($resource){
				return $resource('http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/image/:id'
				);
			}
		]
	)
	.factory('sessionService', function($http, $cookieStore){
		
		var currentUser = $cookieStore.get('user') || {};
		function changeUser (userFromServer) {
	       	angular.extend(currentUser, {
	       		username : userFromServer.userAdministration.username,
	       		lastname : userFromServer.userAdministration.lastname,
	       		firstname: userFromServer.userAdministration.firstname
	       	});
	       	$cookieStore.put('user',currentUser);
	    };

		return {
			user : currentUser,

			
			login : function(loginData, success, error) {
				$http({
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

		        }).success(function (user) {
				    	changeUser(user);
				    	success(user);
				}).error(error);
			}
		}
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
	})
	.factory('bookmarksFactory', function($http){
		var factory = {};
		var bookmarkslist = {};
		var bookmark = {};

		return {
			getBookmark : function(id, successMethod, errorMethod){
				$http.get('http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/bookmark/' + id)
				.success(function(data) {
					bookmark = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			},
			createBookmark : function(bm, id, successMethod, errorMethod) {
				var q = 'http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/' + id + "/add";
				console.log(q);
				$http({
					url : q,
		            isArray: false,
		            method: 'POST',
		            data : bm,
		           	headers: {'Content-Type': 'application/json'}
		        }).success(function(data) {
					//bookmarkslist = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			},
			deleteBookmark : function(id, successMethod, errorMethod){
				var q = 'http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/bookmark/' + id;
				console.log(q);
				$http.delete(q)
				.success(function(data) {
					bookmark = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			},
			getBookmarksList : function(successMethod, errorMethod){
				$http.get('http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/bookmarklist')
				.success(function(data) {
					bookmarkslist = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			},
			createBookmarksList : function(listData, successMethod, errorMethod) {
				$http({
					url : 'http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/bookmarklist',
		            isArray: false,
		            method: 'POST',
		            data : listData,
		           	headers: {'Content-Type': 'application/json'}
		        }).success(function(data) {
					bookmarkslist = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			},
			deleteBookmarksList : function(id, successMethod, errorMethod){
				var q = 'http://crazyhorse.archaeologie.uni-koeln.de/arachnedataservice/bookmarklist/' + id;
				console.log(q);
				$http.delete(q)
				.success(function(data) {
					bookmarkslist = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			}
		}
	});


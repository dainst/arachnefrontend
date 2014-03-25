'use strict';

/* Services */
angular.module('arachne.services', [])
	.factory('arachneSearch', 
		['$resource','$location', 'arachneSettings', 
			function($resource, $location, arachneSettings) {

			//PRIVATE
		        function parseUrlFQ (fqParam) {
		        	if(!fqParam) return;
					var facets = [];
					fqParam = fqParam.split(/\"\,/);
					for (var i = fqParam.length - 1; i >= 0; i--) {
						var facetNameAndVal = fqParam[i].replace(/"/g,'').split(':');

						facets.push({
							name: facetNameAndVal[0],
							value: facetNameAndVal[1]
						});
					};
					return facets;
				};

			  // THIS IS WHERE THE JUICE IS COMING FROM
			  // All server connections should be defined in this resource
		        var arachneDataService = $resource('', { }, {
		        	query: {
			        	url : arachneSettings.dataserviceUri + '/search',
			            isArray: false,
			            method: 'GET',
			            transformResponse : function (data) {
			            	var data = JSON.parse(data);
			            	data.page = ((data.offset? data.offset : 0) / (data.limit? data.limit : 50))+1;
			            	return data;
			            }
			        },
		        	context :  {
		        		//in transformReponse an Array gets build, so an array should be the aspected result
		        		isArray: true,
			        	url : arachneSettings.dataserviceUri + '/contexts/:id',
			            method: 'GET',
			            transformResponse : function (data) {
			            	data = JSON.parse(data).facets['facet_kategorie'];
			            	var context = [];
			            	for(var facetValue in data) {
			            		var facetValueObject = {
			            			'facetValueName' : facetValue,
			            			'count' : data[facetValue],
			            			'entities' : []
			            		}
			            		context.push(facetValueObject);
			            	} 
			            	return context;
			            }
		        	},
		        	contextEntities : {
		        		isArray: true,
			        	url : arachneSettings.dataserviceUri + '/contexts/:id',
			            method: 'GET',
			            transformResponse : function (data) {
			            	return JSON.parse(data).entities;
			            }

		        	}
		    	});
				
				//USE GETTERS FOR THESE:
				var _activeFacets  = [];
		        var _currentQueryParameters  = {};
		        var _resultIndex = null;

		      	
		     //PUBLIC
		        return {
		        	
		          //SEARCHING METHODS
		        	persistentSearch : function (queryParams) {
		        		if (queryParams) {
		        			this.setCurrentQueryParameters(queryParams);
		        		} else {
		        			if($location.$$search.fq) this.setActiveFacets($location.$$search.fq);
		        			this.setCurrentQueryParameters($location.$$search);
		        		}
			            return arachneDataService.query(_currentQueryParameters);
			        },

			        search : function (queryParams) {
			        	if (queryParams) {
		        			this.setCurrentQueryParameters(queryParams);
		        		}
			        	return arachneDataService.query(_currentQueryParameters);
			        },
			        getContext : function (queryParams) {
			        	return arachneDataService.context(queryParams);
			        },
			        getContextualEntities : function (queryParams) {
			        	return arachneDataService.contextEntities(queryParams);
			        },
			        
			      
			      //SETTERS FOR VARIABLES
			      	setResultIndex : function (resultIndex) {
			        	_resultIndex = parseInt(resultIndex);
			        },
			        setCurrentQueryParameters : function (queryParams) {
			        	angular.copy(queryParams,_currentQueryParameters);
			        },
			        setActiveFacets : function (facetsParam) {
			        	angular.copy(parseUrlFQ($location.$$search.fq), _activeFacets );
			        },
			        
			      //GETTERS FOR VARIABLES
			        getActiveFacets : function () {
			        	return _activeFacets;
			        },
			        getCurrentQueryParameters : function () {
			        	return _currentQueryParameters
			        },
			        getResultIndex : function () {
			        	return _resultIndex;
			        },
			        

			        goToPage : function (page) {
			        	var hash = $location.$$search;
			        	if (!hash.limit) hash.limit = 50; //_defaultLimit;
			        	hash.offset = hash.limit*(page-1);
			        	$location.search(hash);
			        },
			        addFacet : function (facetName, facetValue) {
			        	//Check if facet is already included
						for (var i = _activeFacets.length - 1; i >= 0; i--) {
							if (_activeFacets[i].name == facetName) return;
						};

						var hash = $location.$$search;

						if (hash.fq) {
							hash.fq += "," + facetName + ':"' + facetValue + '"';
						} else {
							hash.fq = facetName + ':"' + facetValue + '"';
						}

						$location.search(hash);
		        	},

		        	removeFacet : function (facet) {
		        		for (var i = _activeFacets.length - 1; i >= 0; i--) {
							if (_activeFacets[i].name == facet.name) {
								_activeFacets.splice(i,1);
							}
						};
						
						var facets = _activeFacets.map(function(facet){
							return facet.name + ':"' + facet.value + '"';
						}).join(",");

						var hash = $location.$$search;
						hash.fq = facets;

						$location.search(hash);
		        	},

		        	getMarkers : function(queryParams){
		        		if (queryParams) {
		        			this.setCurrentQueryParameters(queryParams);
		        		} else {
		        			if($location.$$search.fq) this.setActiveFacets($location.$$search.fq);
		        			this.setCurrentQueryParameters($location.$$search);
		        		}
			            return arachneDataService.query(_currentQueryParameters, function (data) {
			            	data.markers = new L.MarkerClusterGroup();

							// title += value.link + "'>Objekte zu diesem Ort anzeigen</a>"
							// title = title.replace('#simpleBrowsing', '#search')
							
			            	for(var entry in data.facets.facet_geo)
			            	{
			           			var num =0;
			            		if (data.facets.facet_geo.hasOwnProperty(entry)) 
    								num = data.facets.facet_geo[entry];
			            		var coordsString = entry.substring(entry.indexOf("[", 1)+1, entry.length - 1);
								var coords = coordsString.split(',');
								var title = "<b>" + entry.substring(0, entry.indexOf("[", 1)-1) + "</b><br/>";
								title += "Einträge zu diesem Ort: " + num + "<br>";
								title += "<a href='search?q=*&fq=facet_geo:\"" + entry +  "\"'>Diese Einträge anzeigen</a>";

								var marker = L.marker(new L.LatLng(coords[0], coords[1]), { title: title });
								marker.bindPopup(title);
								data.markers.addLayer(marker);
			            	} 
			            	return data 
	            		});
			        }
		        }

			
		}])

	.factory('arachneEntity',
		['$resource', 'arachneSettings',
			function($resource, arachneSettings){
				return $resource( arachneSettings.dataserviceUri + '/entity/:id'
				);
			}
		]
	)
	.factory('arachneEntityImg', ['$resource', '$http', 'arachneSettings', function($resource, $http, arachneSettings){
		var factory = {};
		factory.getXml = function(id){
			return $http.get(arachneSettings.dataserviceUri + '/image/zoomify/' + id.id +'/ImageProperties.xml');
		}
		return factory;
	}])
	.factory('sessionService', ['$http', '$cookieStore', 'arachneSettings', function($http, $cookieStore, arachneSettings){
		
		var currentUser = $cookieStore.get('user') || {};

		function changeUser (userFromServer) {
			
			// Expiration is set to 'session'!
			//	var date = new Date();
			//	date.setTime(date.getTime()+(1*60*1000));
			//	var _expires = date.toUTCString();
			//	var _offset = -date.getTimezoneOffset()/60;

	       	angular.extend(currentUser, {
	       		username : userFromServer.userAdministration.username,
	       		lastname : userFromServer.userAdministration.lastname,
	       		firstname: userFromServer.userAdministration.firstname
	       	});
	       	// Angulars cookiestore does not handle expires-parameter after the user-object. use native cookie-method
	       	// Expiration is set to 'session' by using expires=''
	       	document.cookie = 'user='+JSON.stringify(currentUser)+';timezone='+_offset+';expires=;path=/';
	    };

		return {
			user : currentUser,

			
			login : function(loginData, success, error) {
				$http({
					url :  arachneSettings.dataserviceUri + '/sessions',
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
	}])
	.factory('newsFactory', ['$http', 'arachneSettings', function($http, arachneSettings){
		var factory = {};
		factory.getNews = function() {
				return $http.get( arachneSettings.dataserviceUri + '/news/de');
			};
		return factory;
	}])
	.factory('teaserFactory', ['$http', 'arachneSettings', function($http, arachneSettings){
		var factory = {};
		factory.getTeaser = function() {
				return $http.get( arachneSettings.dataserviceUri + '/teasers/de');
			};
		return factory;
	}])
	.factory('bookmarksFactory', ['$http', 'arachneSettings', function($http, arachneSettings){
		var factory = {};
		var bookmarkslist = {};
		var bookmark = {};

		factory.checkEntity  = function(entityID, successMethod, errorMethod){
			var response = [];
			factory.getBookmarksList(
				function(data){
					response = data;
					var entityBookmark = [];
					console.log("bookmark entity");

					for(var x in response){
					//console.log(response[x].name);
						for(var y in response[x].bookmarks){
							//console.log(bookmark);
							if(response[x].bookmarks[y].arachneEntityId == entityID)
							{
								entityBookmark = response[x].bookmarks[y];
							}
						}
					}

					successMethod(entityBookmark);
				}, function(status){
					if(status == 404)
						console.log("keine BookmarksListe enthalten");
					else if(status == 403)
						console.log("bitte einloggen");
					else
						console.log("unknown error");

					errorMethod(status);

				});			
			
			//console.log("NICHT VORHANDEN!");
		};

		factory.getBookmarksList = function(successMethod, errorMethod){
				return $http.get( arachneSettings.dataserviceUri + '/bookmarklist')
				.success(function(data) {
					bookmarkslist = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			};

		factory.createBookmarksList = function(listData, successMethod, errorMethod) {
				$http({
					url :  arachneSettings.dataserviceUri + '/bookmarklist',
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
			};

		factory.deleteBookmarksList = function(id, successMethod, errorMethod){
				var q = arachneSettings.dataserviceUri + '/bookmarklist/' + id;
				console.log(q);
				$http.delete(q)
				.success(function(data) {
					bookmarkslist = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			};
		factory.getBookmark = function(id, successMethod, errorMethod){
					$http.get( arachneSettings.dataserviceUri + '/bookmark/' + id)
					.success(function(data) {
						bookmark = data;
						successMethod(data);
					}).error(function(data, status, header, config){
						errorMethod(status);
					});
			};
		factory.updateBookmark = function(bm, id, successMethod, errorMethod) {
				var q =  arachneSettings.dataserviceUri + '/bookmark/' + id;
				console.log(q);
				$http({
					url : q,
		            isArray: false,
		            method: 'POST',
		            data : bm,
		           	headers: {'Content-Type': 'application/json'}
		        }).success(function(data) {
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			};
		factory.createBookmark = function(bm, id, successMethod, errorMethod) {
				var q =  arachneSettings.dataserviceUri + '/bookmarkList/' + id + '/add';
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
			};
		factory.deleteBookmark = function(id, successMethod, errorMethod){
				var q =  arachneSettings.dataserviceUri + '/bookmark/' + id;
				console.log(q);
				$http.delete(q)
				.success(function(data) {
					bookmark = data;
					successMethod(data);
				}).error(function(data, status, header, config){
					errorMethod(status);
				});
			};
		return factory;
	}]);


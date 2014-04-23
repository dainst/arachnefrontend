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

			  // Define all server connections in this angular-resource
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
							var facets = JSON.parse(data).facets;
							var categoryFacet = {};
							for (var i = facets.length - 1; i >= 0; i--) {
								if(facets[i].name == "facet_kategorie") {
									categoryFacet = facets[i];
									break;
								}
							};
							
							return categoryFacet.values;
						}
					},
					contextEntities : {
						isArray: true,
						url : arachneSettings.dataserviceUri + '/contexts/:id',
						method: 'GET',
						transformResponse : function (data) {
							return JSON.parse(data).entities;
						}

					},
					queryWithMarkers : {
						url : arachneSettings.dataserviceUri + '/search',
						isArray: false,
						method: 'GET',
						transformResponse : function (data) {
							var data = JSON.parse(data);
							data.page = ((data.offset? data.offset : 0) / (data.limit? data.limit : 50))+1;
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
								title += "Einträge, <b>insgeamt</b>: " + num + "<br>";
								title += "<a href='search?q=*&fq=facet_geo:\"" + entry +  "\"'>Diese Einträge anzeigen</a>";

								var marker = L.marker(new L.LatLng(coords[0], coords[1]), { title: title });
								marker.bindPopup(title);
								data.markers.addLayer(marker);
							}
							return data;
						}

					}
				});
				
				//USE GETTERS FOR THE FOLLOWING ATTRIBUTES!
				var _activeFacets  = [];
				var _currentQueryParameters  = {};
				var _resultIndex = null;

				
			 //PUBLIC
				return {
					
				  //SEARCHING METHODS
				  	// persitentSearch means that all queryParams get saved by this factory
					persistentSearch : function (queryParams) {
						if (queryParams) {
							this.setCurrentQueryParameters(queryParams);
						} else {
							if($location.$$search.fq) this.setActiveFacets($location.$$search.fq);
							this.setCurrentQueryParameters($location.$$search);
						}
						return arachneDataService.query(_currentQueryParameters);
					},

					search : function (queryParams, successMethod) {
						return arachneDataService.query(queryParams, successMethod);
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
						if(_currentQueryParameters != queryParams) {
							if(queryParams.offset) queryParams.offset = parseInt(queryParams.offset);
							if(queryParams.limit) queryParams.limit = parseInt(queryParams.limit);
							angular.copy(queryParams,_currentQueryParameters);
						}
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

					persistentSearchWithMarkers : function(queryParams){
						if (queryParams) {
							this.setCurrentQueryParameters(queryParams);
						} else {
							if($location.$$search.fq) this.setActiveFacets($location.$$search.fq);
							this.setCurrentQueryParameters($location.$$search);
						}
						return arachneDataService.queryWithMarkers(_currentQueryParameters);
					}
				}

			
		}])

	.factory('arachneEntity',
		['$resource', 'arachneSettings',
			function($resource, arachneSettings) {

			  // PERSISTENT OBJECTS, PRIVATE, USE GETTERS AND SETTERS
				var _currentEntity = {};
			  //SERVERCONNECTION (PRIVATE)
				var arachneDataService = $resource('', { }, {
					get : {
						url: arachneSettings.dataserviceUri + '/entity/:id',
						isArray : false,
						method: 'GET'
					},
					getSpecialNavigations : {
						url: arachneSettings.dataserviceUri + '/specialNavigationsService?type=entity&id=:id',
						isArray : false,
						method: 'GET'
					},
					getImageProperties : {
						url: arachneSettings.dataserviceUri + '/image/zoomify/:id/ImageProperties.xml',
						isArray : false,
						method: 'GET',
						transformResponse : function (data) {
							var properties = {};
							if (window.DOMParser) {
								var parser = new DOMParser();
								properties = parser.parseFromString(data,"text/xml");
							} else {
								properties = new ActiveXObject("Microsoft.XMLDOM");
								properties.async=false;
								properties.loadXML(data);
							}
							return {
								width : properties.firstChild.getAttribute('WIDTH'),
								height : properties.firstChild.getAttribute('HEIGHT'),
								tilesize : properties.firstChild.getAttribute('TILESIZE')
							};
						}
					}
				});

			  // PUBLIC
				return {
					getEntityById : function(entityId) {
						if (_currentEntity.entityId == entityId) {
							//Caching!
							return _currentEntity;
						} else {
							_currentEntity = arachneDataService.get({id:entityId});
							return _currentEntity;
						}
					},
					getImageProperties : function(queryParams){
						return arachneDataService.getImageProperties(queryParams);
					},
					getSpecialNavigations : function(entityId) {
						return arachneDataService.getSpecialNavigations({id:entityId});
					}
				}
			}
		]
	)
	.factory('sessionService', ['$resource', '$cookieStore', 'arachneSettings', function($resource, $cookieStore, arachneSettings){
		
		var _currentUser = $cookieStore.get('user') || {};

		var arachneDataService = $resource('', { }, {
			login: {
				url :  arachneSettings.dataserviceUri + '/sessions',
				isArray: false,
				method: 'POST',
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				}
			},
			logout: {
				url : arachneSettings.dataserviceUri + '/sessions/:sid',
				isArray: false,
				method: 'DELETE'
			}
		});

		function changeUser (userFromServer) {
			
			// Expiration is set to 60mins.
				var date = new Date();
				date.setTime(date.getTime()+(60*60*1000));
				var _expires = date.toUTCString();
				var _offset = -date.getTimezoneOffset()/60;

			angular.extend(_currentUser, {
				username : userFromServer.userAdministration.username,
				lastname : userFromServer.userAdministration.lastname,
				firstname: userFromServer.userAdministration.firstname,
				sid  : userFromServer.sid
			});
			// Angulars cookiestore does not handle expires-parameter after the user-object. use native cookie-method
			// Expiration is set to 'session' by using expires=''
			document.cookie = 'user='+JSON.stringify(_currentUser)+';timezone='+_offset+';expires='+_expires+';path=/';
		};
		function removeCookie () {
			angular.copy({},_currentUser);
			document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"; 
		};

		return {
			user : _currentUser,

			getUserInfo : function () {
				return arachneDataService.getUserInfo();
			},
			login : function(loginData, successMethod, errorMethod) {
				arachneDataService.login(loginData, function (response) {
					changeUser(response);
					successMethod(response);
				}, errorMethod);
			},
			logout : function (successMethod) {
				arachneDataService.logout(
					{sid : _currentUser.sid},
					function () {
						removeCookie();
						successMethod();
					});
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
.factory('NoteService', ['$resource', 'arachneSettings', '$http', function($resource, arachneSettings, $http){
		
		var checkEntity  = function(entityID, successMethod, errorMethod){
			var response = [];
			$http({method: 'GET', url: arachneSettings.dataserviceUri + '/bookmarklist'}).success(
				function(data){
					response = data;
					var entityBookmark = [];

					for(var x in response){
						for(var y in response[x].bookmarks){
							if(response[x].bookmarks[y].arachneEntityId == entityID)
								entityBookmark = response[x].bookmarks[y];
						}
					}
					successMethod(entityBookmark);
				}).error(function(status){
					errorMethod(status);
				});	
		};

		var arachneDataService = $resource('', { }, {
			getBookmarkInfo : {
				url : arachneSettings.dataserviceUri + '/search',
				isArray: false,
				method: 'GET'
			},
			createBookmarksList: {
				url :  arachneSettings.dataserviceUri + '/bookmarklist',
				isArray: false,
				method: 'POST',
				headers: {'Content-Type': 'application/json'}
			},
			getBookmarksLists : {
				url : arachneSettings.dataserviceUri + '/bookmarklist',
				isArray: true,
				method: 'GET'
			},
			deleteBookmarksList: {
				url : arachneSettings.dataserviceUri + '/bookmarklist/:id',
				isArray: false,
				method: 'DELETE'
			},
			deleteBookmark: {
				url : arachneSettings.dataserviceUri + '/bookmark/:id',
				isArray: false,
				method: 'DELETE'
			},
			getBookmark: {
				url: arachneSettings.dataserviceUri + '/bookmark/:id',
				isArray: false,
				method: 'GET'
			},
			updateBookmark: {
				url: arachneSettings.dataserviceUri + '/bookmark/:id',
				isArray: false,
				method: 'POST',
				headers: {'Content-Type': 'application/json'}
			},
			createBookmark: {
				url :  arachneSettings.dataserviceUri + '/bookmarkList/:id/add',
				isArray: false,
				method: 'POST',
				headers: {'Content-Type': 'application/json'}
			}
		});

		return{
			getBookmarkInfo : function(bookmarksLists, successMethod, errorMethod){	
				var hash = new Object();
				var entityIDs = new Array();
				
				for(var x in bookmarksLists){
					for(var y in bookmarksLists[x].bookmarks){
						entityIDs.push(bookmarksLists[x].bookmarks[y].arachneEntityId);					
					}
				}
				hash.q = "entityId:(" + entityIDs.join(" OR ") + ")";

				return arachneDataService.getBookmarkInfo(hash, successMethod, errorMethod);
			},
			checkEntity : function(entityID, successMethod, errorMethod){
				return checkEntity(entityID, successMethod, errorMethod);
			},
			getBookmarksList : function(successMethod, errorMethod){
				return arachneDataService.getBookmarksLists({}, successMethod, errorMethod);
			},
			createBookmarksList : function(listData, successMethod, errorMethod) {
				return arachneDataService.createBookmarksList(listData, successMethod, errorMethod);
			},
			deleteBookmarksList : function(id, successMethod, errorMethod){
				return arachneDataService.deleteBookmarksList({ "id": id}, successMethod,errorMethod);
			},
			deleteBookmark : function(id, successMethod, errorMethod){
				return arachneDataService.deleteBookmark({ "id": id}, successMethod,errorMethod);
			},
			getBookmark : function(id, successMethod, errorMethod){
				return arachneDataService.getBookmark({ "id": id}, successMethod,errorMethod);
			},
			updateBookmark: function(bm, id, successMethod, errorMethod) {
				console.log(bm);
				return arachneDataService.updateBookmark({ "id": id}, bm, successMethod,errorMethod);
			},
			createBookmark : function(bm, id, successMethod, errorMethod) {
				return arachneDataService.createBookmark({"id": id}, bm, successMethod,errorMethod);
			}
		}
	}]);

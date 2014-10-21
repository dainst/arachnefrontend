'use strict';

/* Services */
angular.module('arachne.services', [])
	.factory('arachneSearch', 
		['$resource','$location', 'arachneSettings', 
			function($resource, $location, arachneSettings) {

			//PRIVATE
				function parseUrlFQ (fqParam) {
					if(!fqParam) return [];
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
							angular.forEach(data.facets, function(facet, index) {
								if (arachneSettings.openFacets.indexOf(facet.name) != -1) {
									facet.open = true;
								} else {
									facet.open = false;
								}
							});

							return data;
						}
					},

					queryWithMarkers : {
						url : arachneSettings.dataserviceUri + '/search',
						isArray: false,
						method: 'GET',
						transformResponse : function (data) {
							var data = JSON.parse(data);
							data.page = ((data.offset? data.offset : 0) / (data.limit? data.limit : 50))+1;
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
							this.setActiveFacets($location.search().fq);
							this.setCurrentQueryParameters($location.search());
						}
						return arachneDataService.query(_currentQueryParameters);
					},

					search : function (queryParams, successMethod) {
						return arachneDataService.query(queryParams, successMethod);
					},
					
					
				  
				  //SETTERS FOR VARIABLES
					setResultIndex : function (resultIndex) {
						_resultIndex = parseInt(resultIndex);
					},
					setCurrentQueryParameters : function (queryParams) {
						if(_currentQueryParameters != queryParams) {
							if(queryParams.offset) queryParams.offset = parseInt(queryParams.offset);
							if(queryParams.limit) queryParams.limit = parseInt(queryParams.limit);
							if(queryParams.view) queryParams.view = queryParams.view;
							if(queryParams.offset==0) delete queryParams.offset;
							if(queryParams.limit==0) delete queryParams.limit;
							angular.copy(queryParams,_currentQueryParameters);
						}
					},
					setActiveFacets : function () {
						angular.copy(parseUrlFQ($location.search().fq), _activeFacets );
						//console.log(_activeFacets);
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
					

					goToPage : function (page, view) {
						var hash = $location.search();
						if (!hash.limit) hash.limit = 50; //_defaultLimit;
						hash.offset = hash.limit*(page-1);
						hash.view = view;
						$location.search(hash);
					},
					addFacet : function (facetName, facetValue) {
						//Check if facet is already included
						for (var i = _activeFacets.length - 1; i >= 0; i--) {
							if (_activeFacets[i].name == facetName) return;
						};

						var hash = $location.search();

						if (hash.fq) {
							hash.fq += "," + facetName + ':"' + facetValue + '"';
						} else {
							hash.fq = facetName + ':"' + facetValue + '"';
						}

						delete(hash.offset);
						delete(hash.limit);
						
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

						var hash = $location.search();
						hash.fq = facets;

						delete(hash.offset);
						delete(hash.limit);

						$location.search(hash);
					},

					persistentSearchWithMarkers : function(queryParams){
						if (queryParams) {
							this.setCurrentQueryParameters(queryParams);
						} else {							
							this.setActiveFacets($location.search().fq);
							this.setCurrentQueryParameters($location.search());
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
				var _activeContextFacets  = [];

			  //SERVERCONNECTION (PRIVATE)
				var arachneDataService = $resource('', { }, {
					get : {
						url: arachneSettings.dataserviceUri + '/entity/:id',
						isArray : false,
						method: 'GET'
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
					contextQuery : {
						isArray: false,
						url : arachneSettings.dataserviceUri + '/contexts/:id',
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
							if(data) {
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
					}
				});

				function serializeParamsAndReturnContextSearch () {
					var queryParams = { id : _currentEntity.entityId };
					queryParams.fq = _activeContextFacets.map(function(facet){return facet.name + ":" + facet.value}).join(',')

					return arachneDataService.contextQuery(queryParams);
				};

				var catchError = function(response) {
					_currentEntity.error = response.status;
				};


			  // PUBLIC
				return {
					resetActiveContextFacets : function() {
						_activeContextFacets = [];
					},
					getActiveContextFacets : function () {
						return _activeContextFacets;
					},
					getEntityById : function(entityId, successMethod) {
						successMethod = successMethod || function () {};
						
						if (_currentEntity.entityId == entityId) {
							//Caching!
							return _currentEntity;
						} else {
							_currentEntity = arachneDataService.get({id:entityId},successMethod, catchError);
							return _currentEntity;
						}
					},
					getImageProperties : function(queryParams){
						return arachneDataService.getImageProperties(queryParams);
					},
					getSpecialNavigations : function(entityId) {
						return arachneDataService.getSpecialNavigations({id:entityId});
					},
					getContext : function (queryParams) {
						return arachneDataService.context(queryParams);
					},
					getContextualEntitiesByAddingCategoryFacetValue : function (facetValue) {
						// important to note: this method doesnt use _activeFacets!
						return arachneDataService.contextEntities({id: _currentEntity.entityId, fq: 'facet_kategorie:' + facetValue});
					},
					getContextualQueryByAddingFacet : function (facetName, facetValue) {

						// Check if facet is already added
						for (var i = _activeContextFacets.length - 1; i >= 0; i--) {
							if (_activeContextFacets[i].name == facetName) return;
						};
						// Add facet
						_activeContextFacets.push({name: facetName, value: facetValue});
						
						return serializeParamsAndReturnContextSearch();
					},
					getContextualQueryByRemovingFacet : function (facet) {
						//remove Facet
						for (var i = _activeContextFacets.length - 1; i >= 0; i--) {
							if (_activeContextFacets[i].name == facet.name) {
								_activeContextFacets.splice(i,1);
							}
						};
						
						
						return serializeParamsAndReturnContextSearch()

					},
					resetContextFacets : function () {
						_activeContextFacets = [];
					}
				}
			}
		]
	)
	.factory('authService', ['$http', 'arachneSettings', '$filter', '$cookieStore',
		function($http, arachneSettings, $filter, $cookieStore) {

			// initialize to whatever is in the cookie, if anything
			if ($cookieStore.get('ar-authdata')) {
		    	$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('ar-authdata');
		    } else {
		    	delete $http.defaults.headers.common['Authorization'];
		    }
		 
		    return {

		        setCredentials: function (username, password, successMethod, errorMethod) {
		            var encoded = $filter('base64')(username + ':' + $filter('md5')(password));
		            $http.get(arachneSettings.dataserviceUri + '/', { headers: { 'Authorization': 'Basic ' + encoded } })
		            .success(function(response) {
		            	$http.defaults.headers.common.Authorization = 'Basic ' + encoded;
		            	$cookieStore.put('ar-authdata', encoded);
		            	$cookieStore.put('ar-user', { username: username });
		            	successMethod();
		            }).error(function(response) {
		            	errorMethod(response);
		            });
		        },

		        clearCredentials: function () {
		            document.execCommand("ClearAuthenticationCache");
		            $cookieStore.remove('ar-authdata');
		            $cookieStore.remove('ar-user');
		            delete $http.defaults.headers.common['Authorization'];
		        },

		        getUser: function() {
		        	return $cookieStore.get('ar-user');
		        }

		    };

		}
	])
	.factory('newsFactory', ['$http', 'arachneSettings', function($http, arachneSettings){
		var factory = {};
		factory.getNews = function() {
				return $http.get( arachneSettings.dataserviceUri + '/news/de');
			};
		return factory;
	}])
	.factory('NoteService', ['$resource', 'arachneSettings', '$http', '$modal',
		function($resource, arachneSettings, $http, $modal){

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
				updateBookmarksList: {
					url :  arachneSettings.dataserviceUri + '/bookmarklist/:id',
					isArray: false,
					method: 'POST',
					headers: {'Content-Type': 'application/json'}
				},
				getBookmarksList : {
					url: arachneSettings.dataserviceUri + '/bookmarklist/:id',
					isArray: false,
					method: 'GET'
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
			}
		);

		return {
			getBookmarkInfo : function(bookmarksLists, successMethod){
				successMethod = successMethod || function () {};
				var hash = new Object();
				var entityIDs = new Array();
				
				for(var x in bookmarksLists){
					for(var y in bookmarksLists[x].bookmarks){
						entityIDs.push(bookmarksLists[x].bookmarks[y].arachneEntityId);					
					}
				}
				//only do this if there are any bookmarks
				if (entityIDs.length) {
					hash.q = "entityId:(" + entityIDs.join(" OR ") + ")";
					return arachneDataService.getBookmarkInfo(hash, successMethod, catchError);
				};
			},
			queryBookmarListsForEntityId : function(entityID){
				//suche Bookmarks für die Entity ID in dem alle anderen rausgeschmissen werden
				return arachneDataService.getBookmarksLists({}, function(lists){
					for(var listIndex = lists.length-1; listIndex >= 0 ; listIndex--) {
						for(var bookmarkIndex = lists[listIndex].bookmarks.length-1; bookmarkIndex >= 0 ; bookmarkIndex--) {
							if(lists[listIndex].bookmarks[bookmarkIndex].arachneEntityId != entityID) {
							 	lists[listIndex].bookmarks.splice(bookmarkIndex,1);
							 }
						}
					}
				}, catchError);

				
			},
			getBookmarksList : function(id, successMethod, errorMethod){
				return arachneDataService.getBookmarksList({ "id": id}, successMethod,errorMethod);
			},
			getBookmarksLists : function(successMethod){
				successMethod = successMethod || function () {};
				return arachneDataService.getBookmarksLists({},successMethod, catchError);
			},
			createBookmarksList : function(successMethod, errorMethod) {
				var modalInstance = $modal.open({
					templateUrl: 'partials/Modals/createBookmarksList.html'
				});	

				modalInstance.close = function(name, commentary){
					commentary = typeof commentary !== 'undefined' ? commentary : "";
					if(name == undefined || name == "") {
						alert("Bitte Titel eintragen.")							
					} else {
						modalInstance.dismiss();
						var list = {
							'name' : name,
							'commentary' : commentary,
							'bookmarks' : []
						}
						return arachneDataService.createBookmarksList(list, successMethod, errorMethod);
					}
				}
			},
			deleteBookmarksList : function(id, successMethod, errorMethod){
				var id = id;			
				var modalInstance = $modal.open({
					templateUrl: 'partials/Modals/deleteBookmarksList.html'
				});	
				modalInstance.close = function(){
					modalInstance.dismiss();
					return arachneDataService.deleteBookmarksList({ "id": id}, successMethod,errorMethod);
				}
			},
			updateBookmarksList : function (bookmarksList, successMethod, errorMethod) {
				var modalInstance = $modal.open({
					templateUrl: 'partials/Modals/editBookmarksList.html',
					controller : function ($scope) { $scope.bookmarksList = bookmarksList },
					resolve: {
				        'bookmarksList': function () {
				            return bookmarksList;
				        }
					}
				});

				modalInstance.close = function(name,commentary){
					if(bookmarksList.name == undefined || bookmarksList.name == ""){
						alert("Bitte Titel eintragen.");						
					} else {
						modalInstance.dismiss();
						return arachneDataService.updateBookmarksList({"id":bookmarksList.id}, bookmarksList, successMethod, errorMethod);
					}
				}
			},
			deleteBookmark : function(id, successMethod){
				successMethod = successMethod || function () {};
				return arachneDataService.deleteBookmark({ "id": id}, successMethod, catchError);
			},
			getBookmark : function(id, successMethod, errorMethod){
				return arachneDataService.getBookmark({ "id": id}, successMethod,errorMethod);
			},
			updateBookmark: function(bookmark, successMethod, errorMethod) {	
				var modalInstance = $modal.open({
					templateUrl: 'partials/Modals/updateBookmarkModal.html',
					controller: function ($scope) { $scope.bookmark = bookmark },
					resolve: {
				        'bookmark': function () {
				            return bookmark;
				        }
					}
				});

				modalInstance.close = function(commentary){
					if(commentary == undefined || commentary == ""){
						alert("Kommentar setzen!")
					} else {
						modalInstance.dismiss();
						// Achtung, im bookmark-Objekt sind noch Attribute, wie title oder thumbnailId hinzugefügt worden.
						// Hier duerfen aber nur die drei attribute id, arachneEntityId, commenatry übergeben werden, sonst nimmt es das Backend nicht an
						return arachneDataService.updateBookmark(
							{"id":bookmark.id},
							{"id":bookmark.id, "arachneEntityId":bookmark.arachneEntityId, "commentary": commentary},
							successMethod,
							errorMethod
						);
					}
				}
			},
			createBookmark : function(rid, successMethod, errorMethod) {
				arachneDataService.getBookmarksLists(
					function(data){
						if(data.length == 0){
							var modalInstance = $modal.open({
								templateUrl: 'partials/Modals/createBookmarksList.html'
							});	

							modalInstance.close = function(name, commentary){
								commentary = typeof commentary !== 'undefined' ? commentary : "";
								if(name == undefined || name == "") {
									alert("Bitte Titel eintragen.")							
								} else {
									modalInstance.dismiss();
									var list = new Object();
									list.name = name;
									list.commentary = commentary;
									list.bookmarks = [];
									arachneDataService.createBookmarksList(list,
										function(data){
											var modalInstance = $modal.open({
												templateUrl: 'partials/Modals/createBookmark.html',
												controller: 'createBookmarkCtrl'
							      			});

							      			modalInstance.result.then(function (selectedList) { 
							      				if(selectedList.commentary == undefined || selectedList.commentary == "")
							      					selectedList.commentary = "no comment set";

							      				var bm = {
													arachneEntityId : rid,
													commentary : selectedList.commentary
												}
												return arachneDataService.createBookmark({"id": selectedList.item.id}, bm, successMethod,errorMethod);
							      			});
										});
								}
							}
						}
						
						if(data.length >= 1){
							var modalInstance = $modal.open({
								templateUrl: 'partials/Modals/createBookmark.html',
								controller: 'createBookmarkCtrl'
			      			});

			      			modalInstance.result.then(function (selectedList) { 
			      				if(selectedList.commentary == undefined || selectedList.commentary == "")
			      					selectedList.commentary = "no comment set";

			      				var bm = {
									arachneEntityId : rid,
									commentary : selectedList.commentary
								}
								return arachneDataService.createBookmark({"id": selectedList.item.id}, bm, successMethod,errorMethod);
			      			});
			      		}
					}
				);				
			}
		}
	}]);

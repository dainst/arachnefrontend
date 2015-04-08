'use strict';

/* Services */
angular.module('arachne.services', [])

	// singleton service for search access
	// automatically parses the query parameters in the current location
	// and caches query results
	.factory('searchService', ['$location', 'Entity', '$rootScope', 'Query', '$q',
		function($location, Entity, $rootScope, Query, $q) {

			var _currentQuery = Query.fromSearch($location.search());
			var _result = { entities: [] };
			var CHUNK_SIZE = 50;
			var chunkPromise = false;

			// check if query changed in a way that requires a new backend call
			$rootScope.$on("$locationChangeSuccess", function(event, newState, oldState) {
				if (Object.keys($location.search()).length > 0) {
					var newQuery = Query.fromSearch($location.search());
					if (!angular.equals(newQuery.toFlatObject(),_currentQuery.toFlatObject())) {
						_result = { entities: [] };
					}
					_currentQuery = newQuery;
				}
			});

			// wait for other retrieve operations to be finished
			// and retrieve a chunk from the current search result
			function retrieveChunkDeferred(offset) {
				if (chunkPromise) {
					chunkPromise = chunkPromise.then(function(data) {
						return retrieveChunk(offset);
					});
				} else {
					chunkPromise = retrieveChunk(offset);
				}
				return chunkPromise;
			}

			// retrieve a chunk from the current search result
			// checks if the requested chunk is cached, otherwise
			// a new query is sent to the backend
			function retrieveChunk(offset) {

				var deferred = $q.defer();

				// chunk is cached
				if (!angular.isUndefined(_result.entities[offset])) {
					var entities = _result.entities.slice(offset, offset + CHUNK_SIZE);
					chunkPromise = false;
					deferred.resolve(entities);
					return deferred.promise;
				// chunk needs to be retrieved
				} else {
					var query = angular.extend({offset:offset,limit:CHUNK_SIZE},_currentQuery.toFlatObject());
					var entities = Entity.query(query);
					return entities.$promise.then(function(data) {
						_result.size = data.size;
						_result.facets = data.facets;
						if (data.size == 0) { 
							deferred.resolve([]);
						} else {
							if(data.entities) for (var i = 0; i < data.entities.length; i++) {
								_result.entities[parseInt(offset)+i] = data.entities[i];
							}
						}
						chunkPromise = false;
						deferred.resolve(data.entities);
						return deferred.promise;
					});
				}

			}

			return {

				// get a single entity from the current result
				getEntity: function(resultIndex) {

					var deferred = $q.defer();

					if (resultIndex < 1) {
						deferred.reject();
						return deferred.promise;
					}
					
					// resultIndex starts at 1, offset and data[] start at 0
					var offset = Math.floor((resultIndex-1) / CHUNK_SIZE) * CHUNK_SIZE;
					
					return retrieveChunkDeferred(offset).then(function(data) {
						deferred.resolve(data[resultIndex-1 - offset]);
						return deferred.promise;
					});

				},

				// get current facets
				getFacets: function() {
					return _result.facets;
				},

				// get current results size
				getSize: function() {
					return _result.size;
				},

				// get current page as defined by the query's offset
				getCurrentPage: function() {
					var offset = _currentQuery.offset;
					if (angular.isUndefined(offset)) offset = 0;
					return retrieveChunkDeferred(offset);
				},

				// get current query
				currentQuery: function() {
					return _currentQuery;
				}

			}

		}
	])

	// represents a search query
	// handles conversion between string representation for frontend URLs
	// and flat object representation for backend requests
	.factory('Query', function() {

		function Query() {
			this.facets = {};
			this.offset = 0;
			this.limit = 50;
		}

		Query.prototype = {

			// constructs a new query object from this query
			// and adds or replaces a parameter, returns the new query
			setParam: function(key,value) {
				var newQuery = angular.copy(this);
				newQuery[key] = value;
				return newQuery;
			},

			// constructs a new query object from this query
			// and removes a parameter, returns the new query
			removeParam: function(key) {
				var newQuery = angular.copy(this);
				delete newQuery[key];
				return newQuery;
			},

			// constructs a new query object from this query
			// and removes parameters, returns the new query
			removeParams: function(keys) {
				var newQuery = angular.copy(this);
				for (var i = 0; i < keys.length; i++) {
					delete newQuery[keys[i]];
				}
				return newQuery;
			},

			// return a copy of param, always return an array, even
			// if it has one or zero elements
			getArrayParam: function(key) {
				var value = this[key];

				if (angular.isArray(value)) {
					return angular.copy(value);
				} else if (value !== undefined) {
					return [angular.copy(value)];
				} else {
					return [];
				}
			},

			// constructs a new query object from this query
			// and adds an additional facet, returns the new query
			addFacet: function(facetName,facetValue) {
				var newQuery = angular.copy(this);
				newQuery.facets[facetName] = facetValue;
				return newQuery;
			},

			// constructs a new query object from this query
			// and removes a facet, returns the new query
			removeFacet: function(facetName) {
				var newQuery = angular.copy(this);
				delete newQuery.facets[facetName];
				return newQuery;
			},

			// check if query has any particular facet filter attached
			hasFacet: function(facetName) {
				return (facetName in this.facets);
			},

			// check if query has any facet filters attached
			hasFacets: function() {
				return Object.keys(this.facets).length > 0;
			},

			// returns a representation of this query as GET parameters
			// If a paramter is given as an array, mutiple GET-Paramters with
			// the same name are constructed (conforming to $location)
			toString: function() {
				
				var params = [];
				for(var key in this) {
					if (key == 'facets') {
						for(var facetName in this.facets) {
							var facetString = facetName + ":\"" + this.facets[facetName] + "\"";
							params.push("fq=" + encodeURIComponent(facetString));
						}
					} else if (angular.isString(this[key]) || angular.isNumber(this[key])) {
						if(!(key == 'limit') && (this[key] || key == 'resultIndex')) {
							params.push(key + "=" + encodeURIComponent(this[key]));
						}
					} else if (angular.isArray(this[key])) {
						for (var i = 0; i < this[key].length; i++) {
							params.push(key + "=" + encodeURIComponent(this[key][i]));
						}
					}
				}

				if (params.length > 0) {
					return "?" + params.join("&");
				} else {
					return "";
				}
				
			},

			// return a representation of this query as a flat object
			// that can be passed as a params object to $resource and $http
			toFlatObject: function() {
				var object = {};
				var queries = [];
				for(var key in this) {
					if (key == 'facets') {
						object.fq = [];
						for(var facetName in this.facets) {
							var facetString = facetName + ":\"" + this.facets[facetName] + "\"";
							object.fq.push(facetString);
						}
					} else if (key == 'restrict') {
						queries.push("_exists_:" + this[key]);
					} else if (key == 'q') {
						queries.push(this[key]);
					} else if (['fl','limit','sort','desc'].indexOf(key) != -1) {
						object[key] = this[key];
					}
				}
				object.q = queries.join(' AND ');
				return object;
			}

		};

		// factory for building query from angular search object
		Query.fromSearch = function(search) {
			var newQuery = new Query();
			for(var key in search) {
				if (key == 'fq') {
					if (angular.isString(search['fq'])) {
						var facet = search['fq'].split(':');
						if (facet.length == 2)
							newQuery.facets[facet[0]] = facet[1].substr(1,facet[1].length-2);
					} else if (angular.isArray(search['fq'])) {
						search['fq'].forEach(function(facetString) {
							var facet = facetString.split(':');
							newQuery.facets[facet[0]] = facet[1].substr(1,facet[1].length-2);
						})
					}
				} else {
					newQuery[key] = search[key];
				}
			}
			return newQuery;
		}

		return Query;

	})

	// resource interface for backend requests to entity- and search-endpoints
	.factory('Entity', ['$resource', 'arachneSettings', '$q',
		function($resource, arachneSettings, $q) {

			return $resource(
				arachneSettings.dataserviceUri + "/:endpoint/:id",
				{ id: '@entityId' },
				{
					get: { 
						method: 'GET', 
						params: { endpoint: 'entity'} 
					},
					query: { 
						method: 'GET', 
						params: { endpoint: 'search' } 
					},
					contexts: { 
						method: 'GET',
						params: { endpoint: 'contexts'} 
					},
					specialNavigations: {
						method: 'GET',
						url: arachneSettings.dataserviceUri + '/specialNavigationsService'
					},
					imageProperties: {
						method: 'GET',
						url: arachneSettings.dataserviceUri + '/image/zoomify/:id/ImageProperties.xml',
						cache: false,
						interceptor: {
							response: function(response) {
								var data = response.data;
								console.log(data);
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
									if(properties.firstChild)
									return {
										width : properties.firstChild.getAttribute('WIDTH'),
										height : properties.firstChild.getAttribute('HEIGHT'),
										tilesize : properties.firstChild.getAttribute('TILESIZE')
									};
								}
							}
						}
					}
				}
			);

		}
	])

	// singleton service for authentication, stores credentials in browser cookie
	// if cookie is present the stored credentials get sent with every backend request
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
	.factory('newsFactory', ['$http', 'arachneSettings', '$timeout', function($http, arachneSettings){
		var factory = {};
		factory.getNews = function() {
				return $http.get( arachneSettings.dataserviceUri + '/news/de');
			};
		return factory;
	}])

	.factory('categoryService', ['$http', function($http ){

		var categories = null;

		var promise = $http.get('config/category.json').then(function(response) {
			categories = response.data;
			return categories;
		});

		var factory = {};

		factory.getCategoriesAsync = function() {
			return promise;
		};

		factory.getCategories = function() {
			return categories;
		};

		factory.getSingular = function(category) {
			if (category in categories && "singular" in categories[category]) {
				return categories[category].singular;
			} else {
				return category;
			}
		}

		return factory;

	}])

	.factory('con10tService', function($http) { 
		var factory = {};
		factory.getTop = function() {
    		return $http.get('con10t/top.json');
		}
		factory.getProjects = function() {
    		return $http.get('con10t/projects.json');
		}
		factory.getFront = function() {
    		return $http.get('con10t/front.json');
		}
		return factory;
	})
	
	.factory('messageService', ['$http', function($http) {

		var messageTypes;
		$http.get('config/messageTypes.json').success(function(response) {
			messageTypes = response;
		});
		var messages = {};

		return {

			addMessage: function(id, heading, body, level) {
				var message = {
					heading: heading,
					body: body,
					level: level
				};
				messages[id] = message;
			},

			addMessageForCode: function(code) {
				if (code in messageTypes) {
					messages[code] = messageTypes[code];
				} else {
					messages['default'] = messageTypes['default'];
				}
			},

			removeMessage: function(code) {
				delete messages[code];
			},

			getMessages: function() {
				return messages;
			}

		}

	}])
	.factory('noteService', ['$resource', 'arachneSettings', '$http', '$modal', 'authService',
		function($resource, arachneSettings, $http, $modal, authService){

			var catchError = function(errorReponse) {
				if (errorReponse.status == 403) {
					// really?
					authService.clearCredentials();
				};
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
			});

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
						hash.limit = entityIDs.length;
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
					var successMethod = successMethod || function () {};
					return arachneDataService.deleteBookmark({ "id": id }, successMethod, catchError);
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
													controller: 'CreateBookmarkCtrl'
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
									controller: 'CreateBookmarkCtrl'
				      			});

				      			modalInstance.result.then(function (result) {
				      				var bm = {
										arachneEntityId : rid,
										commentary : result.commentary
									}
									return arachneDataService.createBookmark({"id": result.list.id}, bm, successMethod,errorMethod);
				      			});
				      		}
						}
					);				
				}
			}
		}
	])
.factory('catalogService', ['$resource', 'arachneSettings', '$http', '$modal', 'authService',
		function($resource, arachneSettings, $http, $modal, authService){

			var catchError = function(errorReponse) {
				if (errorReponse.status == 403) {
					// really?
					authService.clearCredentials();
				};
			};

			var arachneDataService = $resource('', { }, {
				getEntityInformation : {
					url : arachneSettings.dataserviceUri + '/search',
					isArray: false,
					method: 'GET'
				},
				createCatalog: {
					url :  arachneSettings.dataserviceUri + '/catalog',
					isArray: false,
					method: 'POST',
					headers: {'Content-Type': 'application/json'}
				},
				updateCatalog: {
					url :  arachneSettings.dataserviceUri + '/catalog/:id',
					isArray: false,
					method: 'POST',
					headers: {'Content-Type': 'application/json'}
				},
				getCatalog : {
					url: arachneSettings.dataserviceUri + '/catalog/:id',
					isArray: false,
					method: 'GET'
				},
				getCatalogs : {
					url : arachneSettings.dataserviceUri + '/catalog',
					isArray: true,
					method: 'GET'
				},
				deleteCatalog: {
					url : arachneSettings.dataserviceUri + '/catalog/:id',
					isArray: false,
					method: 'DELETE'
				},
				deleteHeading: {
					url : arachneSettings.dataserviceUri + '/catalogheading/:id',
					isArray: false,
					method: 'DELETE'
				},
				getHeading: {
					url: arachneSettings.dataserviceUri + '/catalogheading/:id',
					isArray: false,
					method: 'GET'
				},
				addHeading: {
					url: arachneSettings.dataserviceUri + '/catalogheading/:id/addheading',
					isArray: false,
					method: 'POST',
					headers: {'Content-Type': 'application/json'}
				},
				createHeading: {
					url :  arachneSettings.dataserviceUri + '/catalogheading/:id',
					isArray: false,
					method: 'POST',
					headers: {'Content-Type': 'application/json'}
				},
				deleteEntry: {
					url : arachneSettings.dataserviceUri + '/catalogentry/:id',
					isArray: false,
					method: 'DELETE'
				},
				getEntry: {
					url: arachneSettings.dataserviceUri + '/catalogentry/:id',
					isArray: false,
					method: 'GET'
				},
				updateEntry: {
					url: arachneSettings.dataserviceUri + '/catalogentry/:id',
					isArray: false,
					method: 'POST',
					headers: {'Content-Type': 'application/json'}
				},
				createEntry: {
					url :  arachneSettings.dataserviceUri + '/catalogheading/:id/addentry',
					isArray: false,
					method: 'POST',
					headers: {'Content-Type': 'application/json'}
				}
			});

			return {
				getEntityInformation : function(catalog, successMethod){
					successMethod = successMethod || function () {};
					var hash = new Object();
					var entityIDs = new Array();
					
					
					//only do this if there are any bookmarks
					if (entityIDs.length) {
						hash.q = "entityId:(" + entityIDs.join(" OR ") + ")";
						hash.limit = entityIDs.length;
						return arachneDataService.getEntityInformation(hash, successMethod, catchError);
					};
				},
				// --- Demnaechst vom Backend geloest
				//queryListsForEntityId : function(entityID){
				getCatalog : function(id, successMethod, errorMethod){
					return arachneDataService.getCatalog({ "id": id}, successMethod,errorMethod);
				},
				getCatalogs : function(successMethod){
					successMethod = successMethod || function () {};
					return arachneDataService.getCatalogs({},successMethod, catchError);
				},
				createCatalog : function(successMethod, errorMethod) {
					var modalInstance = $modal.open({
						templateUrl: 'partials/Modals/createCatalog.html'
					});	

					modalInstance.close = function(label, text){
						text = typeof text !== 'undefined' ? text : "";
						if(label == undefined || label == "") {
							alert("Bitte Titel eintragen.")							
						} else {
							modalInstance.dismiss();
							var catalog = {
								'label' : label,
								'text' : text,
								'public' : false,
								'catalogHeadings' : []
							}
							return arachneDataService.createCatalog(catalog, successMethod, errorMethod);
						}
					}
				},
				deleteCatalog : function(id, successMethod, errorMethod){
					var id = id;			
					var modalInstance = $modal.open({
						templateUrl: 'partials/Modals/deleteCatalog.html'
					});	
					modalInstance.close = function(){
						modalInstance.dismiss();
						return arachneDataService.deleteCatalog({ "id": id}, successMethod,errorMethod);
					}
				},
				updateCatalog : function (catalog, successMethod, errorMethod) {
					var modalInstance = $modal.open({
						templateUrl: 'partials/Modals/editCatalog.html',
						controller : function ($scope) { $scope.catalog = catalog },
						resolve: {
					        'catalog': function () {
					            return catalog;
					        }
						}
					});

					modalInstance.close = function(name,commentary){
						if(catalog.name == undefined || catalog.name == ""){
							alert("Bitte Titel eintragen.");						
						} else {
							modalInstance.dismiss();
							return arachneDataService.updateBookmarksList({"id":catalog.id}, catalog, successMethod, errorMethod);
						}
					}
				},
				deleteEntry : function(id, successMethod){
					var successMethod = successMethod || function () {};
					return arachneDataService.deleteEntry({ "id": id }, successMethod, catchError);
				},
				getEntry : function(id, successMethod, errorMethod){
					return arachneDataService.getEntry({ "id": id}, successMethod,errorMethod);
				},
				updateEntry: function(entry, successMethod, errorMethod) {	
					var modalInstance = $modal.open({
						templateUrl: 'partials/Modals/updateEntry.html',
						controller: function ($scope) { $scope.entry = entry },
						resolve: {
					        'entry': function () {
					            return entry;
					        }
						}
					});

					modalInstance.close = function(text){
						if(text == undefined || text == ""){
							alert("Kommentar setzen!")
						} else {
							modalInstance.dismiss();
							// Achtung, im bookmark-Objekt sind noch Attribute, wie title oder thumbnailId hinzugefügt worden.
							// Hier duerfen aber nur die drei attribute id, arachneEntityId, commenatry übergeben werden, sonst nimmt es das Backend nicht an
							return arachneDataService.updateEntry(
								{"id":entry.id},
								{"id":entry.id, "arachneEntityId":entry.arachneEntityId, "label":entry.label, "text": entry.text, "path" : entry.path},
								successMethod,
								errorMethod
							);
						}
					}
				},
				createEntry : function(ArachneId, successMethod, errorMethod) {
					arachneDataService.getCatalogs(
						function(data){
							if(data.length == 0){
								var modalInstance = $modal.open({
									templateUrl: 'partials/Modals/createCatalog.html'
								});	

								modalInstance.close = function(label, text){
									commentary = typeof text !== 'undefined' ? text : "";
									if(label == undefined || label == "") {
										alert("Bitte Titel eintragen.")							
									} else {
										modalInstance.dismiss();
										var catalog = new Object();
										catalog.label = label;
										catalog.text = text;
										catalog.catalogHeadings = [];
										arachneDataService.createCatalog(catalog,
											function(data){
												var modalInstance = $modal.open({
													templateUrl: 'partials/Modals/createEntry.html',
													controller: 'CreateEntryCtrl'
								      			});

								      			modalInstance.result.then(function (selectedList) { 
								      				if(selectedList.text == undefined || selectedList.text == "")
								      					selectedList.text = "no comment set";

								      				var entry = {
														arachneEntityId : ArachneId,
														label : selectedList.label,
														text : selectedList.text,
														path : selectedList.path
													}
													return arachneDataService.createBookmark({"id": selectedList.item.id}, entry, successMethod,errorMethod);
								      			});
											});
									}
								}
							}
							
							if(data.length >= 1){
								var modalInstance = $modal.open({
									templateUrl: 'partials/Modals/createEntry.html',
									controller: 'CreateEntryCtrl'
				      			});

				      			modalInstance.result.then(function (result) {
				      				var entry = {
										arachneEntityId : ArachneId,
										label : result.label,
										text : result.text,
										path : result.path
									}
									return arachneDataService.createBookmark({"id": result.list.id}, entry, successMethod,errorMethod);
				      			});
				      		}
						}
					);				
				}
			}
		}
	]);

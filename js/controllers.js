'use strict';

/* Controllers */

angular.module('arachne.controllers', ['ui.bootstrap'])
.controller('MenuCtrl',	[ '$scope', '$modal', 'authService', '$location',
	function ($scope,  $modal, authService, $location, $route) {

		$scope.user = authService.getUser();

		$scope.currentPath = $location.$$path;
		$scope.$on("$locationChangeSuccess", function() {			
			$scope.currentPath = $location.$$path;
		});

		//$scope.currentPath = $route.current.originalPath;
		$scope.openLoginModal = function() {
			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/loginForm.html',
				controller: 'LoginCtrl'
			});
			modalInstance.result.then(function(user) {
				$scope.user = user;
			});
		};

		$scope.logout = function() {
			authService.clearCredentials();
			$scope.user = authService.getUser();
			$location.url('/');
		}

	}
])
.controller('LoginCtrl', ['$scope', '$modalInstance', 'authService', '$timeout', '$modal', '$route',
	function($scope, $modalInstance, authService, $timeout, $modal, $route){
		
		$scope.loginData = {};
		$scope.loginerror = false;

		$scope.login = function() {

			authService.setCredentials($scope.loginData.user, $scope.loginData.password, function(response) {
				$scope.loginerror = false;
				var closeModal = function () {
            		$modalInstance.close(authService.getUser());
            		$route.reload();
            	}
                $timeout(closeModal, 500);
			}, function(response) {
				$scope.loginerror = true;
			});

		};

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};
	
	}
])
.controller('SearchController', ['$scope','searchService','singularService', '$filter', 'arachneSettings', '$location',
	function($scope, searchService, singularService, $filter, arachneSettings, $location){

		$scope.singular = singularService.getSingular();

		$scope.currentQuery = searchService.currentQuery();
		$scope.q = angular.copy($scope.currentQuery.q);

		searchService.getCurrentPage().then(function(entities) {
			$scope.entities = entities;
			$scope.resultSize = searchService.getSize();
			$scope.currentPage = $scope.currentQuery.offset / $scope.currentQuery.limit + 1;
			$scope.facets = searchService.getFacets();
			$scope.facets.forEach(function(facet) {
				if(arachneSettings.openFacets.indexOf(facet.name) != -1) {
					facet.open = true;
				} else {
					facet.open = false;
				}
			});
			$scope.cells = $filter('cellsFromEntities')(entities,$scope.currentQuery);
		}, function(response) {
			$scope.resultSize = 0;
			$scope.error = true;
		});

		$scope.go = function(path) {
			$location.url(path);
		};

		$scope.onSelectPage = function() {
			var newOffset = ($scope.currentPage-1) * $scope.currentQuery.limit;
			$location.url('search/' + $scope.currentQuery.setParam('offset', newOffset).toString());
		}

	}
])
.controller('SearchCtrl', ['arachneSearch', '$scope', '$route', '$timeout', '$filter','singularService', /*'arachneSettings',*/
	function ( arachneSearch, $scope, $route, $timeout, $filter, singularService) {

		var currentTemplateURL = $route.current.templateUrl;

		$scope.activeFacets = arachneSearch.getActiveFacets();
		$scope.currentQueryParameters = arachneSearch.getCurrentQueryParameters();
		$scope.listStyle = 'tiles';
		if($scope.currentQueryParameters.view)
			$scope.listStyle = $scope.currentQueryParameters.view;

		$scope.addFacet = function (facetName, facetValue) {
			arachneSearch.addFacet(facetName, facetValue);	
		}

		$scope.removeFacet = function (facet) {
			arachneSearch.removeFacet(facet);
		}
		$scope.singular = singularService.getSingular();


		if (currentTemplateURL == 'partials/category.html' || currentTemplateURL == 'partials/map.html') {
			$scope.searchresults = arachneSearch.persistentSearchWithMarkers();
		} else {
			arachneSearch.persistentSearch(false, function(data) {
				$scope.searchresults = data;
				$scope.cells = $filter('cellsFromEntities')(data.entities,data.offset,$scope.currentQueryParameters);
			}, function(response) {
				$scope.searchresults = {size: 0};
				$scope.error = true;
			});

			document.title = "Suche: " + $scope.currentQueryParameters.q.replace(/\+/g,' ') + " | Arachne";

			$scope.setResultIndex = function (resultIndex) {
				arachneSearch.setResultIndex(resultIndex);
			}
			$scope.onSelectPage = function (view) {				
				arachneSearch.goToPage($scope.searchresults.page, view);
			}
		}
		
	}
])
.controller('ContextCtrl',	['arachneEntity','$scope', '$modalInstance', 
	function (arachneEntity, $scope, $modalInstance) {
		$scope.activeContextFacets = arachneEntity.getActiveContextFacets();
		$scope.searchresults = arachneEntity.getContextualQueryByAddingFacet('facet_kategorie', $scope.categoryFacetValueForContext.value);
		$scope.addFacetToContext = function (facetName, facetValue){
			$scope.searchresults = arachneEntity.getContextualQueryByAddingFacet(facetName, facetValue);
		}
		$scope.removeContextFacet = function (facet){
			$scope.searchresults = arachneEntity.getContextualQueryByRemovingFacet(facet);
		}
		$scope.$on("$locationChangeSuccess", function(event) {
			$modalInstance.close();
		});
	}
])
.controller('EntityCtrl', ['$routeParams', 'searchService', '$scope', '$modal', 'arachneEntity', 'Entity', '$location','arachneSettings', 'NoteService', 'authService', 'singularService',
	function ( $routeParams, searchService, $scope, $modal, arachneEntity, Entity, $location, arachneSettings, NoteService, authService, singularService ) {
		
		$scope.user = authService.getUser();
		$scope.serverUri = arachneSettings.serverUri;

		$scope.singular = singularService.getSingular();
		$scope.currentQuery = searchService.currentQuery();

		$scope.go = function(path) {
			$location.url(path);
		};

		$scope.queryBookmarListsForEntityId = function(){
			$scope.bookmarklists = NoteService.queryBookmarListsForEntityId($routeParams.id);
		}

		$scope.updateBookmark = function(bookmark){
			NoteService.updateBookmark(bookmark, function(data){
				$scope.queryBookmarListsForEntityId();
			});					
		}

		$scope.deleteBookmark = function(bookmarkId){
			NoteService.deleteBookmark(bookmarkId,
			function(data){
				$scope.queryBookmarListsForEntityId();
			});	
		}

		$scope.createBookmark = function(){
			NoteService.createBookmark($routeParams.id, function(data){
				$scope.queryBookmarListsForEntityId();
			});			
		}

		// TODO Abstract Sections-Template and Logic to seperate unit - for reuse 
		// LOGIC for sections-iteration
		$scope.isArray = function(value) {
			if(angular.isArray(value)) {
				if(value.length == 1) return false;
				return true;
			}
			return false;
		}

		// if no id given, but query get id from search and reload
		if (!$routeParams.id && $scope.currentQuery.hasOwnProperty('resultIndex')) {

			var resultIndex = parseInt($scope.currentQuery.resultIndex);
			searchService.getEntity(resultIndex).then(function(entity) {
				$location.url('entity/' + entity.entityId + $scope.currentQuery.toString());
			});

		} else {
			
			Entity.get({id:$routeParams.id}, function(data) {
				$scope.entity = data;
				document.title = $scope.entity.title + " | Arachne";	
			});

			Entity.contexts({id:$routeParams.id}, function(contexts) {
				$scope.context = contexts.facets[1].values;
			});

			$scope.isBookmark = false;

			if ($scope.currentQuery.hasOwnProperty('resultIndex')) {
				
				$scope.resultIndex = parseInt($scope.currentQuery.resultIndex);
				$scope.resultIndexInput = $scope.resultIndex + 1;
				searchService.getCurrentPage().then(function(results) {
					$scope.searchresults = results;
					$scope.resultSize = searchService.getSize();
				}, function(response) {
					$scope.searchresults = {size: 0};
					$scope.error = true;
				});

				var prevIndex = $scope.resultIndex-1;
				$scope.prevEntity = searchService.getEntity(prevIndex).then(function(entity) {
					$scope.prevEntity = entity;
				}, function() { $scope.prevEntity = false; });
				var nextIndex = $scope.resultIndex+1;
				$scope.nextEntity = searchService.getEntity(nextIndex).then(function(entity) {
					$scope.nextEntity = entity;
				}, function() { $scope.prevEntity = false; });

			}
		}

	}
])
.controller('createBookmarkCtrl', ['$scope', '$modalInstance', 'NoteService', 
	function($scope, $modalInstance, NoteService) {
	
		$scope.items = [];
		$scope.hasBookmarkList = false;
		$scope.selected = {};
		$scope.selected.commentary = "";
		$scope.bookmarkError = 0;

		NoteService.getBookmarksLists(
			function(data){
				//console.log("habe die Liste!");
				$scope.bookmarkError = 0;
				$scope.items = data;
				//console.log($scope.items);
				$scope.selected = {
					item: $scope.items[0]
				};
				$scope.selected.commentary = "";
			}, function(status){
					//console.log("unknown error");
			}
		);

	}
])
.controller('updateBookmarkCtrl', ['$scope', '$modalInstance', 'NoteService', 'bookmark',
	function($scope, $modalInstance, NoteService, bookmark) {
	  $scope.bookmark = bookmark;
	}
])
.controller('BookmarksController',[ '$scope', '$modal', 'arachneEntity', 'authService', 'NoteService','arachneSettings',
	function ($scope, $modal, arachneEntity, authService, NoteService, arachneSettings){

		$scope.bookmarksLists = [];
		$scope.user = authService.getUser();
		$scope.dataserviceUri = arachneSettings.dataserviceUri;

		$scope.getBookmarkInfo = function(){
			NoteService.getBookmarkInfo($scope.bookmarksLists,
				function(data){
					for(var x in $scope.bookmarksLists){						//durchlaue Bookmarks
						for(var y in $scope.bookmarksLists[x].bookmarks){
							for(var z in data.entities){						//sortiere entity infos in die bookmarks ein
								if($scope.bookmarksLists[x].bookmarks[y].arachneEntityId == data.entities[z].entityId)
								{
									$scope.bookmarksLists[x].bookmarks[y].title = data.entities[z].title;
									$scope.bookmarksLists[x].bookmarks[y].type = data.entities[z].type;
									$scope.bookmarksLists[x].bookmarks[y].thumbnailId = data.entities[z].thumbnailId;
								}
							}
						}
					}
				}
			);
		}

		$scope.refreshBookmarkLists = function(){
			$scope.bookmarksLists = NoteService.getBookmarksLists(
				function(){ $scope.getBookmarkInfo(); }
			);
		}

		$scope.refreshBookmarkLists();
		
		$scope.deleteBookmark = function(bookmark){
			NoteService.deleteBookmark(bookmark.id,
				function(data){
					$scope.refreshBookmarkLists();
				});
		}

		$scope.updateBookmark = function(bookmark){
			NoteService.updateBookmark(bookmark, function(data){
				$scope.refreshBookmarkLists();
			});
		}

		$scope.updateBookmarksList = function(listId){
			var bookmarksList;
			NoteService.getBookmarksList(listId, function(data){
				bookmarksList = data;
				NoteService.updateBookmarksList(bookmarksList, function(data){
					$scope.refreshBookmarkLists();
				});
			});
		}

		$scope.createBookmarksList = function(){
			$scope.bookmarksLists.push(NoteService.createBookmarksList(
				function(response){
					// console.log("creating BookmarksList" + response);
					$scope.refreshBookmarkLists();
				}));
		}

		$scope.deleteBookmarksList = function(id){
			NoteService.deleteBookmarksList(id,
				function(data){
					// console.log("deleted List" + data);
					$scope.refreshBookmarkLists();
				});
			
		}

	}
])
.controller('EntityImageCtrl', ['$routeParams', '$scope', 'arachneEntity', '$modal', 'authService', 'searchService', '$location',
	function($routeParams, $scope, arachneEntity, $modal, authService, searchService, $location) {

		$scope.refreshImageIndex = function() {
			if($scope.entity && $scope.entity.images) {
				for (var i = 0; i < $scope.entity.images.length; i++) {
					if ($scope.entity.images[i].imageId == $scope.imageId) {
						$scope.imageIndex = i;
						break;
					}
				}
			}
		};

		$scope.requestFullscreen = function() {
			var element = document.getElementById('theimage');
			// Find the right method, call on correct element			
			if(element.requestFullscreen) {
			    element.requestFullscreen();
			} else if(element.mozRequestFullScreen) {
			    element.mozRequestFullScreen();
			} else if(element.webkitRequestFullscreen) {
			    element.webkitRequestFullscreen();
			} else if(element.msRequestFullscreen) {
			    element.msRequestFullscreen();
			}
		};

		$scope.user = authService.getUser();
		$scope.currentQuery = searchService.currentQuery();
		$scope.entityId = $routeParams.entityId;
		$scope.imageId = $routeParams.imageId;
		arachneEntity.getEntityById($routeParams.entityId, function(data) {
			$scope.entity = data;
			$scope.refreshImageIndex();
		});
		$scope.imageProperties = arachneEntity.getImageProperties({id: $scope.imageId}, function(data) {
			$scope.allow = true;
		}, function(response) {
			$scope.allow = false;
		});

		$scope.$watch("imageId", function() {
			$scope.refreshImageIndex();
		});

	}
])
.controller('EntityImagesCtrl', ['$routeParams', '$scope', 'arachneEntity', '$filter', 'searchService',
	function($routeParams, $scope, arachneEntity, $filter, searchService) {

		$scope.currentQuery = searchService.currentQuery();
		$scope.entityId = $routeParams.entityId;
		$scope.imageId = $routeParams.imageId;
		arachneEntity.getEntityById($routeParams.entityId, function(data) {
			// call to filter detached from view in order to prevent unnecessary calls
			$scope.entity = data;
			$scope.cells = $filter('cellsFromImages')(data.images, data.entityId);
		});

	}
])
.controller('StartSiteController', ['$scope', '$http', 'arachneSettings',
	function ($scope, $http, arachneSettings) {

		$http.get('config/category.json').success(function(data){
            $scope.category = data; 
        });

		$http.get(arachneSettings.dataserviceUri + "/entity/count").success(function(data) {
			$scope.entityCount = data.entityCount;
		});

		this.loadNews = function(){
			if($scope.newsList == null)
				newsFactory.getNews().success(function(data) { $scope.newsList = data;})
		}
	}
])
.controller('AllCategoriesController', ['$scope', 'newsFactory', 'arachneSearch',  '$location', '$anchorScroll', '$http',
	function ($scope, newsFactory, arachneSearch, $location, $anchorScroll, $http) {
		$http.get('config/category.json').success (function(data){
            $scope.category = data; 
        });
	}
])
.controller('ThreeDimensionalController', ['$scope', '$location', '$http', '$modal',
	function ($scope, $location, $http, $modal) {
		this.showInfo = function () {
		
			if(!$scope.metainfos) {
				$http.get("http://" + document.location.host + "/data/model/" + $location.search().id + "?meta=true" ).success (function(data){
					$scope.metainfos = data;
				});
			}

			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/3dInfoModal.html',
				scope: $scope
			});	
			modalInstance.close = function(){
				modalInstance.dismiss();
			}
		
		}
	}
])
.controller('RegisterCtrl', ['$scope', '$http', '$filter', 'arachneSettings',
	function ($scope, $http, $filter, arachneSettings) {

		$scope.user = {};
		$scope.success = false;
		$scope.error = "";

		$scope.submit = function() {
			if ($scope.password && $scope.passwordValidation) {
				$scope.user.password = $filter('md5')($scope.password);
				$scope.user.passwordValidation = $filter('md5')($scope.passwordValidation);
			}
			$http.post(arachneSettings.dataserviceUri + "/user/register", $scope.user, {
				"headers": { "Content-Type": "application/json" }
			}).success(function(data) {
				$scope.error = "";
				$scope.success = true;
			}).error(function(data) {
				$scope.error = data.message;
			});
		}

	}
]);

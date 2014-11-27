'use strict';

/* Controllers */

angular.module('arachne.controllers', ['ui.bootstrap'])
.controller('MenuCtrl',	[ '$scope', '$modal', 'authService', '$location', '$route',
	function ($scope,  $modal, authService, $location, $route) {

		$scope.user = authService.getUser();

		$scope.currentPath = $location.path();
		$scope.$on("$locationChangeSuccess", function() {			
			$scope.currentPath = $location.path();
		});

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
			$route.reload();
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
.controller('SearchCtrl', ['$scope','searchService','categoryService', '$filter', 'arachneSettings', '$location', 'messageService', '$http', '$timeout',
	function($scope, searchService, categoryService, $filter, arachneSettings, $location, messageService, $http, $timeout){
		
		$scope.mapfacet = { depo:'true', find:'false'};
		$scope.currentQuery = searchService.currentQuery();
		$scope.q = angular.copy($scope.currentQuery.q);

		$scope.aFacet = $scope.currentQuery.facets.facet_kategorie;


		$timeout(function() {
			$scope.categoryDB = categoryService.getCategories();
			if(typeof $scope.aFacet != 'undefined'){
				$scope.imgUrl = $scope.categoryDB[$scope.aFacet]["imgUri"];
				$scope.subtitle = $scope.categoryDB[$scope.aFacet]["subtitle"];
			}
		}, 100);	
	
		searchService.getCurrentPage().then(function(entities) {
			$scope.entities = entities;
			$scope.resultSize = searchService.getSize();
			$scope.totalPages = Math.ceil($scope.resultSize / $scope.currentQuery.limit);
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
			if (response.status == '404') messageService.addMessageForCode('backend_missing');
			else messageService.addMessageForCode('search_' +  response.status);
		});

		$scope.go = function(path) {
			$location.url(path);
		};

		$scope.previousPage = function() {
			if ($scope.currentPage > 1)
				$scope.currentPage -= 1;
			$scope.onSelectPage();
		};

		$scope.nextPage = function() {
			if ($scope.currentPage < $scope.totalPages)
				$scope.currentPage += 1;
			$scope.onSelectPage();
		};

		$scope.onSelectPage = function() {
			var newOffset = ($scope.currentPage-1) * $scope.currentQuery.limit;
			$location.url('search/' + $scope.currentQuery.setParam('offset', newOffset).toString());
		};

	}
])
.controller('EntityCtrl', ['$routeParams', 'searchService', '$scope', '$modal', 'Entity', '$location','arachneSettings', 'noteService', 'authService', 'categoryService', 'Query', 'messageService',
	function ( $routeParams, searchService, $scope, $modal, Entity, $location, arachneSettings, noteService, authService, categoryService, Query, messageService) {
		
		$scope.user = authService.getUser();
		$scope.serverUri = arachneSettings.serverUri;

		$scope.categoryDB = categoryService.getCategories();
		$scope.currentQuery = searchService.currentQuery();

		$scope.go = function(path) {
			$location.url(path);
		};

		$scope.queryBookmarkListsForEntityId = function(){
			$scope.bookmarklists = noteService.queryBookmarListsForEntityId($routeParams.id);
		}

		$scope.updateBookmark = function(bookmark){
			noteService.updateBookmark(bookmark, function(data){
				$scope.queryBookmarkListsForEntityId();
			});					
		}

		$scope.deleteBookmark = function(bookmarkId){
			noteService.deleteBookmark(bookmarkId, function(data){
				$scope.queryBookmarkListsForEntityId();
			});	
		}

		$scope.createBookmark = function(){
			noteService.createBookmark($routeParams.id, function(data){
				$scope.queryBookmarkListsForEntityId();
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
				$location.replace();
			});

		} else {
			
			Entity.get({id:$routeParams.id}, function(data) {
				$scope.entity = data;
				document.title = $scope.entity.title + " | Arachne";
			}, function(response) {
				$scope.error = true;
				messageService.addMessageForCode("entity_"+response.status);
			});

			Entity.specialNavigations({id:$routeParams.id, type:'entity'}, function(data) {
				$scope.specialNavigationElements = data.specialNavigationElements;
			}, function(response) {
				messageService.addMessageForCode("entity_"+response.status);
			})
				
			$scope.contextQuery = new Query();
			$scope.contextQuery.label = "Mit " + $routeParams.id + " verknüpfte Objekte";
			$scope.contextQuery.q = "connectedEntities:" + $routeParams.id;
			$scope.contextQuery.limit = 0;
			
			$scope.isBookmark = false;

			if ($scope.currentQuery.hasOwnProperty('resultIndex')) {
				
				$scope.resultIndex = parseInt($scope.currentQuery.resultIndex);
				$scope.resultIndexInput = $scope.resultIndex;
				searchService.getCurrentPage().then(function(results) {
					$scope.searchresults = results;
					$scope.resultSize = searchService.getSize();
				}, function(response) {
					$scope.searchresults = {size: 0};
					messageService.addMessageForCode('search_' + response.status);
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
.controller('CreateBookmarkCtrl', ['$scope', '$modalInstance', 'noteService', 'messageService',
	function($scope, $modalInstance, noteService, messageService) {
	
		$scope.items = [];
		$scope.selected = {};
		$scope.commentary = "";

		noteService.getBookmarksLists(
			function(data){
				$scope.items = data;
				$scope.selected = $scope.items[0];
			}, function(status){
				messageService.addMessageForCode('note_' + response.status);
			}
		);

	}
])
.controller('UpdateBookmarkCtrl', ['$scope', '$modalInstance', 'noteService', 'bookmark',
	function($scope, $modalInstance, noteService, bookmark) {
	  $scope.bookmark = bookmark;
	}
])
.controller('BookmarksController',[ '$scope', '$modal', 'authService', 'noteService','arachneSettings', 'Query',
	function ($scope, $modal, authService, noteService, arachneSettings, Query){

		$scope.bookmarksLists = [];
		$scope.user = authService.getUser();
		$scope.dataserviceUri = arachneSettings.dataserviceUri;

		$scope.getBookmarkInfo = function(){
			noteService.getBookmarkInfo($scope.bookmarksLists,
				function(data){
					for(var x in $scope.bookmarksLists){					//durchlaue Bookmarks
						var entityIDs = [];
						for(var y in $scope.bookmarksLists[x].bookmarks){
							for(var z in data.entities){						//sortiere entity infos in die bookmarks ein
								if($scope.bookmarksLists[x].bookmarks[y].arachneEntityId == data.entities[z].entityId)
								{
									$scope.bookmarksLists[x].bookmarks[y].title = data.entities[z].title;
									$scope.bookmarksLists[x].bookmarks[y].type = data.entities[z].type;
									$scope.bookmarksLists[x].bookmarks[y].thumbnailId = data.entities[z].thumbnailId;
									entityIDs.push(data.entities[z].entityId);
								}
							}
						}
						if ($scope.bookmarksLists[x].hasOwnProperty('bookmarks')) {
							$scope.bookmarksLists[x].query = new Query().setParam('q', "entityId:(" + entityIDs.join(" OR ") + ")");
							$scope.bookmarksLists[x].query.label = "Notizbuch '" + $scope.bookmarksLists[x].name + "'";
						}
					}
				}
			);
		}

		$scope.refreshBookmarkLists = function(){
			$scope.bookmarksLists = noteService.getBookmarksLists(
				function(){ $scope.getBookmarkInfo(); }
			);
		}

		$scope.refreshBookmarkLists();
		
		$scope.deleteBookmark = function(bookmark){
			noteService.deleteBookmark(bookmark.id,
				function(data){
					$scope.refreshBookmarkLists();
				});
		}

		$scope.updateBookmark = function(bookmark){
			noteService.updateBookmark(bookmark, function(data){
				$scope.refreshBookmarkLists();
			});
		}

		$scope.updateBookmarksList = function(listId){
			var bookmarksList;
			noteService.getBookmarksList(listId, function(data){
				bookmarksList = data;
				noteService.updateBookmarksList(bookmarksList, function(data){
					$scope.refreshBookmarkLists();
				});
			});
		}

		$scope.createBookmarksList = function(){
			noteService.createBookmarksList(function(response){
				$scope.bookmarksLists.push($scope.refreshBookmarkLists());
			});
		}

		$scope.deleteBookmarksList = function(id){
			noteService.deleteBookmarksList(id,
				function(data){
					// console.log("deleted List" + data);
					$scope.refreshBookmarkLists();
				});
			
		}

	}
])
.controller('EntityImageCtrl', ['$routeParams', '$scope', '$modal', 'Entity', 'authService', 'searchService', '$location','arachneSettings', '$http', '$window', '$rootScope', 'messageService',
	function($routeParams, $scope, $modal, Entity, authService, searchService, $location, arachneSettings, $http, $window, $rootScope, messageService) {

		$rootScope.hideFooter = true;
		$scope.allow = true;

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

		$scope.downloadImage = function() {
			var imgUri = arachneSettings.dataserviceUri + "/image/" + $scope.imageId;
			var entityUri = arachneSettings.dataserviceUri + "/entity/" + $scope.imageId;
			$http.get(imgUri, { responseType: 'blob' }).success(function(data) {
				var document = $window.document;
				var a = document.createElement('a');
				document.body.appendChild(a);
				a.style = "display:none";
				var blob = new Blob([data], {type: 'image/jpeg'});
				var blobUri = $window.URL.createObjectURL(blob);
				a.href = blobUri;
				$http.get(entityUri).success(function(data) {
					a.download = data.title;
					a.click();
				});
			});
		}

		$scope.user = authService.getUser();
		$scope.currentQuery = searchService.currentQuery();
		$scope.entityId = $routeParams.entityId;
		$scope.imageId = $routeParams.imageId;
		Entity.get({id:$routeParams.entityId}, function(data) {
			$scope.entity = data;
			$scope.refreshImageIndex();
		}, function(response) {
			messageService.addMessageForCode("entity_"+response.status);
		});
		Entity.imageProperties({id: $scope.imageId}, function(data) {
			$scope.imageProperties = data;
			$scope.allow = true;
		}, function(response) {
			if (response.status == '403') {
				$scope.allow = false;
			} else {
				messageService.addMessageForCode('image_' + response.status);
			}
		});

		$scope.$watch("imageId", function() {
			$scope.refreshImageIndex();
		});

	}
])
.controller('EntityImagesCtrl', ['$routeParams', '$scope', 'Entity', '$filter', 'searchService', '$rootScope', 'messageService',
	function($routeParams, $scope, Entity, $filter, searchService, $rootScope, messageService) {

		$rootScope.hideFooter = true;

		$scope.currentQuery = searchService.currentQuery();
		$scope.entityId = $routeParams.entityId;
		$scope.imageId = $routeParams.imageId;
		Entity.get({id:$routeParams.entityId}, function(data) {
			// call to filter detached from view in order to prevent unnecessary calls
			$scope.entity = data;
			$scope.cells = $filter('cellsFromImages')(data.images, data.entityId, $scope.currentQuery);
		}, function(response) {
			messageService.addMessageForCode("entity_"+response.status);
		});

	}
])
.controller('StartSiteController', ['$scope', '$http', 'arachneSettings', 'messageService', 'categoryService', '$timeout',
	function ($scope, $http, arachneSettings, messageService, categoryService, $timeout) {

        $timeout(function() {
        	$scope.categoryDB = categoryService.getCatDB();
        }, 500);
		
		$http.get(arachneSettings.dataserviceUri + "/entity/count").success(function(data) {
			$scope.entityCount = data.entityCount;
		}).error(function(data) {
			messageService.addMessageForCode("backend_missing");
		});

	}
])
.controller('AllCategoriesController', ['$scope', '$http', 'categoryService', '$timeout',
	function ($scope, $http, categoryService, $timeout) {

		$timeout(function() {
			$scope.category = categoryService.getCatDB();
		}, 500);
	}
])
.controller('ThreeDimensionalController', ['$scope', '$location', '$http', '$modal', 'arachneSettings', '$rootScope',
	function ($scope, $location, $http, $modal, arachneSettings, $rootScope) {

		$rootScope.hideFooter = true;
		
		this.showInfo = function () {
		
			if(!$scope.metainfos) {
				$http.get(arachneSettings.dataserviceUri + "/model/" + $location.search().id + "?meta=true" ).success (function(data){
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
])
.controller('MessageCtrl', ['$scope', 'messageService',
	function ($scope, messageService) {

		$scope.messages = messageService.getMessages();

		$scope.removeMessage = function(index) {
			messageService.removeMessage(index);
		}

	}
]);

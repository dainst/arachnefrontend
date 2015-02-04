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
.controller('SearchFormCtrl', ['$scope', '$location',
	function($scope, $location) {

		$scope.search = function(fq) {
			if ($scope.q) {
				var url = '/search?q=' + $scope.q;
				if (fq) url += "&fq=" + fq;
				$scope.q = null;
				$location.url(url);
			}
		}

	}
])
.controller('SearchCtrl', ['$rootScope','$scope','searchService','categoryService', '$filter', 'arachneSettings', '$location', 'messageService', '$http',
	function($rootScope,$scope, searchService, categoryService, $filter, arachneSettings, $location, messageService, $http){

		$rootScope.hideFooter = false;
		
		$scope.currentQuery = searchService.currentQuery();
		$scope.q = angular.copy($scope.currentQuery.q);

		$scope.sortableFields = arachneSettings.sortableFields;
		// ignore unknown sort fields
		if (arachneSettings.sortableFields.indexOf($scope.currentQuery.sort) == -1) {
			delete $scope.currentQuery.sort;
		}

		categoryService.getCategoriesAsync().then(function(categories) {
			$scope.categories = categories;
		});
	
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
.controller('CategoryCtrl', ['$rootScope','$scope', 'Query', 'categoryService', '$location', 'Entity',
	function($rootScope, $scope, Query, categoryService, $location, Entity) {

		$rootScope.hideFooter = false;

		$scope.category = $location.search().c;

		categoryService.getCategoriesAsync().then(function(categories) {
			$scope.title = categories[$scope.category].title;
			$scope.imgUri = categories[$scope.category].imgUri;
			$scope.subtitle = categories[$scope.category].subtitle;
			$scope.mapfacet = categories[$scope.category].geoFacet;
		});

		$scope.currentQuery = new Query().addFacet("facet_kategorie", $scope.category);
		$scope.currentQuery.q = "*";

		Entity.query($scope.currentQuery.toFlatObject(), function(response) {
			$scope.facets = response.facets;
			$scope.resultSize = response.size;
		});

	}
])
.controller('MapCtrl', ['$rootScope', '$scope', 'searchService', 'categoryService', '$location',
	function($rootScope, $scope, searchService, categoryService, $location) {

		$scope.mapfacetNames = ["facet_aufbewahrungsort", "facet_fundort", "facet_geo"]; //, "facet_ort"

		$rootScope.hideFooter = true;

		$scope.currentQuery = searchService.currentQuery();
		$scope.currentQuery.limit = 0;
		if (!$scope.currentQuery.restrict) {
			$scope.currentQuery.restrict = $scope.mapfacetNames[0];
		}
		$scope.facetLimit = $scope.currentQuery.fl;
		$scope.q = angular.copy($scope.currentQuery.q);
	
		searchService.getCurrentPage().then(function(entities) {
			$scope.resultSize = searchService.getSize();
			$scope.facets = searchService.getFacets();
			for (var i = 0; i < $scope.facets.length; i++) {
				if ($scope.facets[i].name == $scope.currentQuery.restrict) {
					$scope.mapfacet = $scope.facets[i];
					break;
				}
			}
		}, function(response) {
			$scope.resultSize = 0;
			$scope.error = true;
			if (response.status == '404') messageService.addMessageForCode('backend_missing');
			else messageService.addMessageForCode('search_' +  response.status);
		});

		$scope.switchMapFacet = function(facetName) {
			$scope.go("map/" + $scope.currentQuery.setParam("restrict", facetName).toString());
		};

		$scope.go = function(path) {
			$location.url(path);
		};

	}
])
.controller('EntityCtrl', ['$rootScope', '$routeParams', 'searchService', '$scope', '$modal', 'Entity', '$location','arachneSettings', 'noteService', 'authService', 'categoryService', 'Query', 'messageService',
	function ($rootScope, $routeParams, searchService, $scope, $modal, Entity, $location, arachneSettings, noteService, authService, categoryService, Query, messageService) {

		$rootScope.hideFooter = false;
		
		$scope.user = authService.getUser();
		$scope.serverUri = arachneSettings.serverUri;

		categoryService.getCategoriesAsync().then(function(categories) {
			$scope.categories = categories;
		});

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
.controller('BookmarksController',['$rootScope', '$scope', '$modal', 'authService', 'noteService','arachneSettings', 'Query', '$filter',
	function ($rootScope, $scope, $modal, authService, noteService, arachneSettings, Query, $filter) {

		$rootScope.hideFooter = false;

		$scope.bookmarksLists = [];
		$scope.user = authService.getUser();
		$scope.dataserviceUri = arachneSettings.dataserviceUri;

		var orderBy = $filter('orderBy');
		$scope.sort = 'id';

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
						$scope.order = function(predicate, reverse){
							$scope.bookmarksLists[x].bookmarks = orderBy($scope.bookmarksLists[x].bookmarks, predicate, reverse);
						};
						$scope.order($scope.sort,false);
					}
				}
			);
		}

		$scope.refreshBookmarkLists = function(){
			$scope.bookmarksLists = noteService.getBookmarksLists(
				function(){ $scope.getBookmarkInfo(); }
			);
		}

		$scope.sortList = function(attr){
			$scope.sort = attr;
			$scope.refreshBookmarkLists();
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
.controller('StartSiteController', ['$rootScope', '$scope', '$http', 'arachneSettings', 'startprojectsFactory', 'messageService', 'categoryService', '$timeout',
	function ($rootScope, $scope, $http, arachneSettings, startprojectsFactory, messageService, categoryService, $timeout) {

		$rootScope.hideFooter = false;

		startprojectsFactory.success(function(projectsMenu){
			var projslides = $scope.projslides = [];
			for(var key in projectsMenu) {
				projslides.push({
					image: "con10t/frontimages/" + projectsMenu[key].id + ".jpg",
					title: projectsMenu[key].text
				});
			}
		});

        categoryService.getCategoriesAsync().then(function(categories) {
			$scope.categories = [];
			var cateslides = $scope.cateslides = [];
			for(var key in categories) {
				if (categories[key].status == 'start') {
					$scope.categories.push(categories[key]);
					cateslides.push({
						image: categories[key].imgUri,
						title: categories[key].title,
						text: categories[key].subtitle
					});
				}
			}
		});
		
		$http.get(arachneSettings.dataserviceUri + "/entity/count").success(function(data) {
			$scope.entityCount = data.entityCount;
		}).error(function(data) {
			messageService.addMessageForCode("backend_missing");
		});

	}
])

.controller('ProjectsController', ['$scope', '$http', 'projectsFactory', function ($scope, $http, projectsFactory) {
		$scope.projectsMenu = null;
		projectsFactory.success(function(data){
			$scope.projectsMenu = data[1].children;
		});
	}
])

.controller('AllCategoriesController', ['$rootScope', '$scope', '$http', 'categoryService', '$timeout',
	function ($rootScope, $scope, $http, categoryService, $timeout) {

		$rootScope.hideFooter = false;

		categoryService.getCategoriesAsync().then(function(categories) {
			$scope.categories = [];
			for(var key in categories) {
				if (categories[key].status != 'none') {
					$scope.categories.push(categories[key]);
				}
			}
		});

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
.controller('RegisterCtrl', ['$rootScope', '$scope', '$http', '$filter', 'arachneSettings',
	function ($rootScope, $scope, $http, $filter, arachneSettings) {

		$rootScope.hideFooter = false;

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

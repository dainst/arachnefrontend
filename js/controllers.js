'use strict';

/* Controllers */

angular.module('arachne.controllers', ['ui.bootstrap'])
.controller('MenuCtrl',
	[ '$scope', '$modal', 'sessionService', '$location',
		function ($scope,  $modal, sessionService, $location){
		$scope.user = sessionService.user;

		$scope.currentPath = $location.$$path;

		//$scope.currentPath = $route.current.originalPath;
		$scope.openLoginModal = function () {
			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/loginForm.html',
				controller: 'LoginCtrl'
			});			
		};
	}
	]
	)
.controller('LoginCtrl',
	['$scope', '$modalInstance', 'sessionService', 'md5Filter', '$timeout', '$modal',
	function($scope, $modalInstance, sessionService, md5Filter, $timeout, $modal){
		$scope.loginData = {};
		$scope.user = sessionService.user;
		$scope.loginerror = false;

		$scope.login = function () {
			//console.log("login");
			sessionService.login(
				{
					user: $scope.loginData.user,
					password: md5Filter($scope.loginData.password)
				},
	            function(response) {
	            	$scope.loginerror = false;
	            	var closeModal = function () {
	            		$modalInstance.dismiss();
	            	}
	                $timeout(closeModal, 1200);
	                
	            },
	            function(error) {
	                $scope.loginerror = true;	               
	                var resetLoginerror = function () {
	                	$scope.loginerror = false;
	                };
	                $timeout(resetLoginerror, 2000);
	            });
		};
		$scope.cancel = function () {
			$modalInstance.dismiss();
		};
	
	}])
.controller('SearchCtrl',
	['arachneSearch', '$scope', '$route', '$timeout', /*'arachneSettings',*/
	function ( arachneSearch, $scope, $route, $timeout) {
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

		if (currentTemplateURL == 'partials/category.html' || currentTemplateURL == 'partials/map.html') {
			$scope.searchresults = arachneSearch.persistentSearchWithMarkers();
		} else {
			$scope.searchresults = arachneSearch.persistentSearch();

			document.title = "Suche: " + $scope.currentQueryParameters.q.replace(/\+/g,' ') + " | Arachne";

			$scope.setResultIndex = function (resultIndex) {
				arachneSearch.setResultIndex(resultIndex);
			}
			$scope.onSelectPage = function (view) {				
				arachneSearch.goToPage($scope.searchresults.page, view);
			}
		}
	}
]
)
.controller('ContextCtrl',
	['arachneEntity','$scope', '$modalInstance', 
		function (arachneEntity, $scope, $modalInstance) {
			$scope.activeContextFacets = arachneEntity.getActiveContextFacets();
			$scope.searchresults = arachneEntity.getContextualQueryByAddingFacet('facet_kategorie', $scope.categoryFacetValueForContext.value);
			$scope.addFacetToContext = function (facetName, facetValue){
				$scope.searchresults = arachneEntity.getContextualQueryByAddingFacet(facetName, facetValue);
			}
			$scope.removeContextFacet = function (facet){
				$scope.searchresults = arachneEntity.getContextualQueryByRemovingFacet(facet);
			}
		}
	]
)
.controller('EntityCtrl',
	['$routeParams', 'arachneSearch', '$scope', '$modal', 'arachneEntity', '$location','arachneSettings', 'NoteService', 'sessionService',
	function ( $routeParams, arachneSearch, $scope, $modal, arachneEntity, $location, arachneSettings, NoteService, sessionService ) {
		$scope.user = sessionService.user;
		$scope.serverUri = arachneSettings.serverUri;

		$scope.loadFacetValueForContextEntities = function (facetValue) {
			$scope.categoryFacetValueForContext =  facetValue;
			if((facetValue.count > 15) || (facetValue.value == "Buchseiten")) {
				var modalInstance = $modal.open({
					templateUrl: 'partials/Modals/contextualEntitiesModal.html',
					controller: 'ContextCtrl',
					size: 'lg',
					scope : $scope
	      		});

				// die facetten müssen zurückgesetzt werden wenn das Kontext-Modal geschlossen wird, damit die nächste Kontext-Suche wieder von vorne beginnen kann
	      		modalInstance.result.finally(function(){
	      			arachneEntity.resetActiveContextFacets();
	      		});
			} else {
				// important to note: getContextualEntitiesByAddingCategoryFacetValue doesnt use _activeFacets!
				// _activeFacets is only for the context modal
				if (!facetValue.entities) facetValue.entities = arachneEntity.getContextualEntitiesByAddingCategoryFacetValue(facetValue.value);
			}
		}
		this.goToResults = function () {
			$location.path('search').search(arachneSearch.getCurrentQueryParameters());
		}
		// this.goToResultNr = function(number) {
		// 	if((number > 0) /*&& (number!=$scope.currentQueryParameters.resultIndex) */ && (number < $scope.nextEntitySearch.size)){
		// 		//arachneSearch.setResultIndex(number)
		// 		// var qHash = angular.copy(arachneSearch.getCurrentQueryParameters());
		// 		// 	qHash.resultIndex = arachneSearch.getResultIndex();
		// 		$scope.currentQueryParameters.resultIndex = number;
		// 		$location.url("entity/" + $scope.nextEntitySearch.entities[0].entityId).search($scope.currentQueryParameters);
		// 	}
		// }
		this.goToNextResult = function () {
			// arachneSearch.setResultIndex($scope.resultIndex+1);
			// var qHash = angular.copy(arachneSearch.getCurrentQueryParameters());
			// 	qHash.resultIndex = arachneSearch.getResultIndex();
			$scope.currentQueryParameters.resultIndex += 1;
			$location.url("entity/" + $scope.nextEntitySearch.entities[0].entityId).search($scope.currentQueryParameters);
		}
		this.goToPreviousResult = function () {
			// arachneSearch.setResultIndex($scope.resultIndex-1);
			// var qHash = angular.copy(arachneSearch.getCurrentQueryParameters());
			// 	qHash.resultIndex = arachneSearch.getResultIndex();

			$scope.currentQueryParameters.resultIndex -= 1;
			$location.url("entity/" + $scope.previousEntitySearch.entities[0].entityId).search($scope.currentQueryParameters);
		}

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
		$scope.typeOf = function(input) {
			var result = typeof input;
			return result;
		}

		

	  // RECONSTRUCT SEARCH-SESSION IF THERE IS ONE IN THE URL-PARAMETERS
		if($location.search().q) {
			var qHash = $location.search()

			$scope.currentQueryParameters = qHash
			$scope.currentQueryParameters.resultIndex = parseInt(qHash.resultIndex);
		}

		$scope.dataserviceUri = arachneSettings.dataserviceUri;
		

		$scope.activeFacets = arachneSearch.getActiveFacets();


		$scope.entity = arachneEntity.getEntityById($routeParams.id, function (){
			document.title = $scope.entity.title + " | Arachne";	
		});

		$scope.specialNavigations = arachneEntity.getSpecialNavigations($routeParams.id);

		$scope.context = arachneEntity.getContext({id:$routeParams.id});


		$scope.isBookmark = false;
		if($scope.currentQueryParameters && $scope.currentQueryParameters.resultIndex != null) {
			var queryhash = {};
			queryhash.q = $scope.currentQueryParameters.q;
			queryhash.resultIndex = $scope.currentQueryParameters.resultIndex;
			queryhash.fq = $scope.currentQueryParameters.fq;
			queryhash.limit = 1;
			queryhash.offset = $scope.currentQueryParameters.resultIndex+1;
			
			$scope.nextEntitySearch = arachneSearch.search(queryhash);
			
			queryhash.offset = $scope.currentQueryParameters.resultIndex-1;
			if(queryhash.offset >= 0) $scope.previousEntitySearch = arachneSearch.search(queryhash);
		}
}])
.controller('createBookmarkCtrl', ['$scope', '$modalInstance', 'NoteService', function($scope, $modalInstance, NoteService){
	
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
		});
}])
.controller('updateBookmarkCtrl', ['$scope', '$modalInstance', 'NoteService', 'bookmark', function($scope, $modalInstance, NoteService, bookmark) {
	  $scope.bookmark = bookmark;
}])
.controller('BookmarksController',[ '$scope', '$modal', 'arachneEntity', 'sessionService', 'NoteService','arachneSettings',
	function ($scope, $modal, arachneEntity, sessionService, NoteService, arachneSettings){

		$scope.bookmarksLists = [];
		$scope.user = sessionService.user;
		$scope.dataserviceUri = arachneSettings.dataserviceUri;
		this.logout = function () {
			sessionService.logout(function () {
				window.location.href = '';
			});
		}

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
}])
.controller('EntityImgCtrl', ['$routeParams', '$scope', 'sessionService', 'arachneEntity', '$modal', 'arachneSettings',
	function ($routeParams, $scope, sessionService, arachneEntity, $modal, arachneSettings) {

		if($routeParams.entityId) {
			$scope.previousImage = null;
		}
		$scope.user = sessionService.user;
		$scope.imageIndex = 0;
		$scope.dataserviceUri = arachneSettings.dataserviceUri;
		$scope.showingImagesGrid = false;
		

		$scope.toggleImageGrid = function () {
			$scope.showingImagesGrid = !$scope.showingImagesGrid;
		}

		this.setImageIndex = function(newIndex) {
			$scope.imageIndex = newIndex;
			this.loadImageProperties();
			this.setNextAndPreviousImages();
			$scope.showingImagesGrid = false;
		}

	  //GALLERY METHODS
		this.loadImageProperties = function () {
			$scope.imageId = $scope.entity.images[$scope.imageIndex].imageId
			$scope.imageProperties = arachneEntity.getImageProperties({id: $scope.imageId});
		}
		this.setNextAndPreviousImages = function () {
			// var currentImageIndex = -1;
			// for (var i = $scope.entity.images.length - 1; i >= 0; i--) {
			// 	if($scope.entity.images[i].imageId == $scope.entityId) $scope.imageIndex = i;
			// };
			$scope.nextImage = ($scope.entity.images[$scope.imageIndex+1])? $scope.entity.images[$scope.imageIndex+1] : null;
			$scope.previousImage = ($scope.entity.images[$scope.imageIndex-1])? $scope.entity.images[$scope.imageIndex-1] : null;
		}

		this.loadEntityForGallery = function () {

			if ($routeParams.entityId) {
				$scope.entity = arachneEntity.getEntityById($routeParams.entityId);
			};
		}
		this.showNextImage = function () {
			$scope.imageIndex++;
			this.loadImageProperties();
			this.setNextAndPreviousImages();

		}
		this.showPreviousImage = function () {
			$scope.imageIndex--;
			this.loadImageProperties();
			this.setNextAndPreviousImages();

		}
	  //METAINFO
		this.getImageEntityForMetainfos = function () {
			if(!$scope.imageEntity) {
				$scope.imageEntity = arachneEntity.getEntityById($scope.imageId);
			} 

			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/metainfos.html',
				scope: $scope
			});	
			modalInstance.close = function(){
				modalInstance.dismiss();
			}
		}
		$scope.requestFullscreen = function () {
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
			

		}
		

	  // LOGIC for sections-iteration
	  // TODO Abstract Sections-Template and Logic to seperate unit - for reuse 
		$scope.isArray = function(value) {
			return angular.isArray(value);
		}
		$scope.typeOf = function(input) {
			var result = typeof input;
			return result;
		}
	  // TODO-END
		this.openModalForImageEntity = function () {
			this.getImageEntityForMetainfos();
		}
		if($routeParams.showingInitialImagesGrid == "true") $scope.toggleImageGrid();
		if($routeParams.imageIndex) {
			$scope.imageIndex = parseInt($routeParams.imageIndex);
		}

}])
.controller('StartSiteController', ['$scope', 'newsFactory', 'arachneSearch',  '$location', '$anchorScroll', '$http',
	function ($scope, newsFactory, arachneSearch, $location, $anchorScroll, $http) {

		$scope.selection = 'search';
		var hash = new Object();
		hash.q = "*";

		$http.get('config/category.json').success (function(data){
            $scope.category = data; 
        });

		$scope.newsList = null;
		$scope.projectList = null;

		$scope.search = arachneSearch.search(hash);

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

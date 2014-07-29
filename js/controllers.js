'use strict';

/* Controllers */

angular.module('arachne.controllers', ['ui.bootstrap'])
.controller('MenuCtrl',
	[ '$scope', '$modal', 'sessionService', 
		function ($scope,  $modal, sessionService){
		$scope.user = sessionService.user;

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
	['arachneSearch', '$scope', '$route', 
	function ( arachneSearch, $scope, $route) {
		var currentTemplateURL = $route.current.templateUrl;

		$scope.activeFacets = arachneSearch.getActiveFacets();
		$scope.currentQueryParameters = arachneSearch.getCurrentQueryParameters();



		this.addFacet = function (facetName, facetValue) {
			arachneSearch.addFacet(facetName, facetValue);	
		}

		this.removeFacet = function (facet) {
			arachneSearch.removeFacet(facet);
		}

		if (currentTemplateURL == 'partials/category.html' || currentTemplateURL == 'partials/map.html') {
			$scope.searchresults = arachneSearch.persistentSearchWithMarkers();
		} else {
			$scope.searchresults = arachneSearch.persistentSearch();

			$scope.setResultIndex = function (resultIndex) {
				arachneSearch.setResultIndex(resultIndex);
			}
			$scope.onSelectPage = function () {
				arachneSearch.goToPage($scope.searchresults.page);
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
			return angular.isArray(value);
		}
		$scope.typeOf = function(input) {
			var result = typeof input;
			return result;
		}

	  // RECONSTRUCT SEARCH-SESSION IF THERE IS ONE IN THE URL-PARAMETERS
		if($location.$$search.q) {
			var qHash = $location.$$search

			$scope.currentQueryParameters = qHash
			$scope.currentQueryParameters.resultIndex = parseInt(qHash.resultIndex);
		}

		$scope.dataserviceUri = arachneSettings.dataserviceUri;
		

		$scope.activeFacets = arachneSearch.getActiveFacets();


		$scope.entity = arachneEntity.getEntityById($routeParams.id);
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
.controller('NewsController', ['$scope', 'newsFactory', 'arachneSearch', function ($scope, newsFactory, arachneSearch) {

		angular.element(document).ready(function () {
        	$scope.screenHeight = window.outerHeight-480;
			$scope.screenHeight += "px";
    	});
		
		$scope.selection = 'search';
		var hash = new Object();
		hash.q = "*";

		$scope.categoryStarts = [
			{
				imageId : 424501,
				title : "Bauwerke",
				description :'Gebäude oder Monumente, die auch übergeordnete Kontexte zu einem Einzelobjekt oder einem mehrteiligen Denkmal sein können.',
				customlink : "category/?q=*&fq=facet_kategorie:Bauwerke&fl=1500"
			},
			{
				imageId : 1933196,
				title : "Bauwerksteile",
				description :'Erfassung von Untergliederungen eines Gebäudes: Geschosse, Sektionen, Räume.',
				customlink : "category/?q=*&fq=facet_kategorie:bauwerksteil&fl=1500"
			},
			{
				imageId : 158019,
				title : "Objekte",
				description :'Objekte der realen Welt, die keine mehrteiligen Denkmäler, Bauwerke oder Topographien sind.',
				customlink : "category/?q=*&fq=facet_kategorie:objekt&fl=1500"
			},
			{
				imageId : 1922705,
				title : "Szenen",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.',
				customlink : "category/?q=*&fq=facet_kategorie:relief&fl=1500"
			},
			{
				imageId : 46777,
				title : "Marbilder",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.',
				customlink : "category/?q=*&fq=facet_kategorie:marbilder&fl=1500"
			},
			{
				imageId : 230879,
				title : "Bücher",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.',
				customlink : "category/?q=*&fq=facet_kategorie:Bücher&fl=1500"
			},
			{
				imageId : 433041,
				title : "Sammlungen",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.',
				customlink : "category/?q=*&fq=facet_kategorie:sammlungen&fl=1500"
			},
			{
				imageId : 3099823,
				title : "Topographien",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.',
				customlink : "category/?q=*&fq=facet_kategorie:topografie&fl=1500"
			},
			{
				imageId : 251347,
				title : "Rezeptionen",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.',
				customlink : "category/?q=*&fq=facet_kategorie:rezeption&fl=1500"
			}



		];

		$scope.search = arachneSearch.search(hash);

		$scope.newsList = null;
		$scope.projectList = null;

		this.loadNews = function(){
			if($scope.newsList == null)
				newsFactory.getNews().success(function(data) { $scope.newsList = data;})
		}
}]);

'use strict';

/* Controllers */

angular.module('arachne.controllers', ['ui.bootstrap'])
.controller('MenuCtrl',
	[ '$scope', '$modal', 'sessionService',
	function ($scope,  $modal, sessionService){
		$scope.user = sessionService.user;

		$scope.openLoginModal = function () {
			var modalInstance = $modal.open({
				templateUrl: 'loginForm.html',
				controller: 'LoginCtrl'	
			});				    
		};
	}
	]
	)
.controller('LoginCtrl',
	['$scope', '$modalInstance', 'sessionService', 'md5Filter', '$timeout',
	function($scope, $modalInstance, sessionService, md5Filter, $timeout){
		$scope.loginData = {};
		$scope.user = sessionService.user;
		$scope.loginerror = false;
		$scope.login = function () {
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
	
	}
	]
	)
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
			$scope.onSelectPage = function (p) {
				$scope.currentPage = p;
				arachneSearch.goToPage(p);
			}
		}

}
]
)
.controller('EntityCtrl',
	['$routeParams', 'arachneSearch', '$scope', '$modal', 'arachneEntity', 'bookmarksFactory', '$location',
	function ( $routeParams, arachneSearch, $scope, $modal, arachneEntity, bookmarksFactory, $location ) {
		$scope.loadFacetValueForContextEntities = function (facetValue) {
			if (!facetValue.entities.length) facetValue.entities = arachneSearch.getContextualEntities({id :$routeParams.id, fq: 'facet_kategorie:' + facetValue.facetValueName});
		}
		this.goToResults = function () {
			$location.path('search').search(arachneSearch.getCurrentQueryParameters());
		}
		this.goToNextResult = function () {
			arachneSearch.setResultIndex($scope.resultIndex+1);
			var qHash = angular.copy(arachneSearch.getCurrentQueryParameters());
				qHash.resultIndex = arachneSearch.getResultIndex();
			$location.url("entity/" + $scope.nextEntitySearch.entities[0].entityId).search(qHash);

		}
		this.goToPreviousResult = function () {
			arachneSearch.setResultIndex($scope.resultIndex-1);
			var qHash = angular.copy(arachneSearch.getCurrentQueryParameters());
				qHash.resultIndex = arachneSearch.getResultIndex();
			$location.url("entity/" + $scope.previousEntitySearch.entities[0].entityId).search(qHash);
		}
		
		$scope.reloadBM = function(){
				bookmarksFactory.checkEntity($routeParams.id, function(data){;
				if(data.length == 0){
					console.log("Die Entity ist nicht gebookmarkt");
					$scope.bookmark = {};
					$scope.isBookmark = false;
				}
				else{
					$scope.isBookmark = true;
					$scope.bookmark = data;
				}
				
			}, function(status){
				console.log(status)
			});
		}
		$scope.deleteBookmark = function(){
			bookmarksFactory.deleteBookmark($scope.bookmark.id,
			function(data){
				console.log("deleted Bookmark" + data);
				$scope.reloadBM();
			}, function(status){
				console.log("error deleting Bookmark" + status);
				$scope.reloadBM();
			});
			
		}
		$scope.createBookmarkModal = function(){
			var modalInstance = $modal.open({
				templateUrl: 'createBookmark.html',
				controller: 'createBookmarkCtrl',
      		});

      		modalInstance.result.then(function (selectedList) { 
      			if(selectedList.commentary == undefined || selectedList.commentary == "")
      				selectedList.commentary = "no comment set";

      			var bm = {
					arachneEntityId : $routeParams.id,
					commentary : selectedList.commentary
				}
				bookmarksFactory.createBookmark(bm, selectedList.item.id, function(data){
					console.log("bookmark erstellt");
					$scope.reloadBM();
				}, function(status){
					console.log(status);
				});
      		});
		}
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
			if(qHash.fq) {
				arachneSearch.setActiveFacets(qHash.fq);
			}
			if (qHash.resultIndex) {
				arachneSearch.setResultIndex(qHash.resultIndex);
			}
			delete qHash.resultIndex;
			arachneSearch.setCurrentQueryParameters(qHash);
		}

		$scope.currentQueryParameters = arachneSearch.getCurrentQueryParameters();
		$scope.activeFacets = arachneSearch.getActiveFacets();
		$scope.resultIndex = arachneSearch.getResultIndex();

		$scope.entity = arachneEntity.getEntityById($routeParams.id);
		$scope.context = arachneSearch.getContext({id:$routeParams.id});
		$scope.isBookmark = false;
		$scope.reloadBM();

		if($scope.resultIndex != null) {
			var queryhash = angular.copy(arachneSearch.getCurrentQueryParameters());
			queryhash.limit = 1;
			queryhash.offset = $scope.resultIndex+1;
			
			$scope.nextEntitySearch = arachneSearch.search(queryhash);
			
			queryhash.offset = $scope.resultIndex-1;
			if(queryhash.offset >= 0) $scope.previousEntitySearch = arachneSearch.search(queryhash);
		}		
}])
.controller('createBookmarkCtrl', ['$scope', '$modalInstance', 'bookmarksFactory', function($scope, $modalInstance, bookmarksFactory){
	
	$scope.items = [];
	$scope.hasBookmarkList = false;
	$scope.selected = {};
	$scope.selected.commentary = "";
	$scope.bookmarkError = 0;

	bookmarksFactory.getBookmarksList(
			function(data){
				$scope.bookmarkError = 0;
				$scope.items = data;
				$scope.selected = {
    				item: $scope.items[0]
  				};
  				$scope.selected.commentary = "commentary";
			}, function(status){
				if(status == 404)
					$scope.bookmarkError = status;
				else if(status == 403)
					$scope.bookmarkError = status;
				else
					console.log("unknown error");
		});
}])
.controller('BookmarksController',[ '$scope', 'bookmarksFactory', '$modal', 'arachneEntity', 'sessionService',
	function ($scope, bookmarksFactory, $modal, arachneEntity, sessionService){

		$scope.bookmarksLists = [];
		$scope.bmStatus = 0;
		$scope.bE = [];
		$scope.user = sessionService.user;

		this.logout = function () {
			sessionService.logout(function () {
				window.location.href = '';
			});
		}

		$scope.refreshBookmarkLists = function(){
			bookmarksFactory.getBookmarksList(
				function(data){
					$scope.bookmarksLists = data;
					$scope.bookmarksLists.notEmpty = true;
					$scope.bmStatus = 0;
					console.log("BookmarksList erhalten");
				}, function(status){
					if(status == 404)
					{
						$scope.bookmarksLists = [];
						$scope.bmStatus = 404;
					}
					else if(status == 403)
					{
						$scope.bookmarksLists = [];
						$scope.bmStatus = 403;
					}
					else
						console.log("unknown error");
				}
			);
		}

		$scope.refreshBookmarkLists();
		
		$scope.deleteBookmark = function(id){
			bookmarksFactory.deleteBookmark(id,
				function(data){
					console.log("deleted Bookmark" + data);
					$scope.refreshBookmarkLists();
				}, function(status){
					console.log("error deleting Bookmark" + status);
				});
		}

		$scope.updateBookmarkModal= function(id){
			var modalInstance = $modal.open({
				templateUrl: 'updateBookmarkModal.html'
			});	

			modalInstance.close = function(commentary){
				if(commentary == undefined || commentary == ""){
					alert("Kommentar setzen!")
				}else{
					modalInstance.dismiss();
					$scope.updateBookmark(id, commentary);
				}
			}
		}

		$scope.updateBookmark = function(id, commentary){
			var bm = new Object();
			bookmarksFactory.getBookmark(id,
				function(data){
					console.log("got Bookmark" + data);
					bm = data;
					bm.commentary = commentary;

					bookmarksFactory.updateBookmark(bm, id,
						function(data)
						{
							console.log("Bookmark changed" + data);
							$scope.refreshBookmarkLists();
						}, function(status){
							console.log("error changing bookmark "+ status);
							$scope.bmStatus = status;
						});	
					$scope.refreshBookmarkLists();
				}, function(status){
					console.log("error getting Bookmark" + status);
				});	
		}

		$scope.createBookmarksListModal = function(){
			var modalInstance = $modal.open({
				templateUrl: 'createBookmarksList.html'
			});	

			modalInstance.close = function(name, commentary){
				if(name == undefined || name == "")
				{
					alert("Name setzen!")							
				}else if(commentary == undefined || commentary == ""){
					alert("Kommentar setzen!")
				}else{
					modalInstance.dismiss();
					$scope.createBookmarksList(name, commentary, []);
				}
			}
		}

		$scope.createBookmarksList = function(name, commentary, bookmarks){
			var list = new Object();
			list.name = name;
			list.commentary = commentary;
			list.bookmarks = bookmarks;

			bookmarksFactory.createBookmarksList(list, 
				function(data)
				{
					console.log("Liste erstellt" + data);
					$scope.refreshBookmarkLists();
				}, function(status){
					console.log("error creating list "+ status);
					$scope.bmStatus = status;
				});
			
		}

		$scope.deleteBookmarksList = function(id){
			bookmarksFactory.deleteBookmarksList(id,
				function(data){
					console.log("deleted List" + data);
					$scope.refreshBookmarkLists();
				}, function(status){
					console.log("error deleting list" + status);
					$scope.bmStatus = status;
				});
			
		}
}])
.controller('EntityImgCtrl', ['$routeParams', '$scope', 'arachneEntityImg', 'sessionService', 'arachneEntity', 
	function ($routeParams, $scope, arachneEntityImg, sessionService, arachneEntity) {
		if($routeParams.entityId) {
			
			$scope.previousImage = null;
		}
		$scope.user = sessionService.user;
		$scope.entityId = $routeParams.imageId;
		
		//GALLERY METHODS
		this.loadImageProperties = function () {
			$scope.imageProperties = arachneEntityImg.getImageProperties({id: $scope.entityId});
		}
		this.setNextAndPreviousImages = function () {
			var currentImageIndex = -1;
			for (var i = $scope.entity.images.length - 1; i >= 0; i--) {
				if($scope.entity.images[i].imageId == $scope.entityId) currentImageIndex = i;
			};
			$scope.nextImage = ($scope.entity.images[currentImageIndex+1])? $scope.entity.images[currentImageIndex+1] : null;
			$scope.previousImage = ($scope.entity.images[currentImageIndex-1])? $scope.entity.images[currentImageIndex-1] : null;

		}
		this.loadEntityForGallery = function () {
			if ($routeParams.entityId) {
				$scope.entity = arachneEntity.getEntityById($routeParams.entityId);
			};
		}		
}])
.controller('NewsController', ['$scope', 'newsFactory', 'teaserFactory', 'arachneSearch', function ($scope, newsFactory, teaserFactory, arachneSearch) {

		$scope.screenHeight = window.outerHeight-290;
		$scope.selection = 'search';
		var hash = new Object();
		hash.q = "*";

		$scope.categoryStarts = [
			{
				imageId : 424501,
				title : "Bauwerke",
				description :'Gebäude oder Monumente, die auch übergeordnete Kontexte zu einem Einzelobjekt oder einem mehrteiligen Denkmal sein können.'
			},
			{
				imageId : 1933196,
				title : "Bauwerksteile",
				description :'Erfassung von Untergliederungen eines Gebäudes: Geschosse, Sektionen, Räume.'
			},
			{
				imageId : 158019,
				title : "Objekte",
				description :'Objekte der realen Welt, die keine mehrteiligen Denkmäler, Bauwerke oder Topographien sind.'
			},
			{
				imageId : 1922705,
				title : "Szenen",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.'
			},
			{
				imageId : 46777,
				title : "Marbilder",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.'
			},
			{
				imageId : 230879,
				title : "Bücher",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.'
			},
			{
				imageId : 433041,
				title : "Sammlungen",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.'
			},
			{
				imageId : 3099823,
				title : "Topographien",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.'
			},
			{
				imageId : 251347,
				title : "Rezeptionen",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.'
			}



		];

		$scope.search = arachneSearch.search(hash);

		newsFactory.getNews().success(function(data) { $scope.newsList = data;})		
		teaserFactory.getTeaser().success(function(data) {$scope.teaserList = data;})
}]);

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
	['$routeParams', 'arachneSearch', '$scope', '$modal', 'arachneEntity', '$location','arachneSettings', 'NoteService', 'sessionService',
	function ( $routeParams, arachneSearch, $scope, $modal, arachneEntity, $location, arachneSettings, NoteService, sessionService ) {

		$scope.user = sessionService.user;

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
		this.goToResultByIndex = function(index) {
			var queryhash = angular.copy(arachneSearch.getCurrentQueryParameters());
			queryhash.limit = 1;
			queryhash.offset = index
			
			arachneSearch.search(queryhash, function(response){
				arachneSearch.setResultIndex(index);
				delete queryhash.limit
				$location.url("entity/" + response.entities[0].entityId).search(queryhash);
			});
		}
		
		$scope.getBookmarkStatus = function(){
			NoteService.checkEntity($routeParams.id, function(data){;
				if(data.length == 0){
					$scope.bookmark = {};
					$scope.isBookmark = false;
				}
				else{
					$scope.isBookmark = true;
					$scope.bookmark = data;
				}
				
			}, function(status){
				console.log(status)
				$scope.bookmark = {
					commentary: "session Kaputt, bitte erneut an und abmelden!"
				};
				$scope.isBookmark = true;
			});
		}
		$scope.deleteBookmark = function(){
			NoteService.deleteBookmark($scope.bookmark.id,
			function(data){
				// console.log("deleted Bookmark" + data);
				$scope.getBookmarkStatus();
			}, function(status){
				console.log("error deleting Bookmark" + status);
				getBookmarkStatus();
			});	
		}
		$scope.createBookmarkModal = function(){
			NoteService.checkEntity($routeParams.id, function(data){;
				if(data.length == 0){
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
						//console.log("tryin create bookmark");
						NoteService.createBookmark(bm, selectedList.item.id, function(data){
							// console.log("bookmark erstellt");
							$scope.getBookmarkStatus();
						}, function(status){
							console.log(status);
						});
		      		});
				}
				else{
					// console.log("allready bookmarked!!");
					$scope.bookmark = data;
					$scope.isBookmark = true;
				}
				
			}, function(status){
				console.log(status)
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
			if(qHash.fq) {
				arachneSearch.setActiveFacets(qHash.fq);
			}
			if (qHash.resultIndex) {
				arachneSearch.setResultIndex(qHash.resultIndex);
			}
			delete qHash.resultIndex;
			arachneSearch.setCurrentQueryParameters(qHash);
		}

		$scope.dataserviceUri = arachneSettings.dataserviceUri;
		
		$scope.currentQueryParameters = arachneSearch.getCurrentQueryParameters();
		$scope.activeFacets = arachneSearch.getActiveFacets();
		$scope.resultIndex = arachneSearch.getResultIndex();

		$scope.entity = arachneEntity.getEntityById($routeParams.id);
		$scope.specialNavigations = arachneEntity.getSpecialNavigations($routeParams.id);
		$scope.context = arachneSearch.getContext({id:$routeParams.id});
		$scope.isBookmark = false;

		if($scope.resultIndex != null) {
			var queryhash = angular.copy(arachneSearch.getCurrentQueryParameters());
			queryhash.limit = 1;
			queryhash.offset = $scope.resultIndex+1;
			
			$scope.nextEntitySearch = arachneSearch.search(queryhash);
			
			queryhash.offset = $scope.resultIndex-1;
			if(queryhash.offset >= 0) $scope.previousEntitySearch = arachneSearch.search(queryhash);
		}
}])
.controller('createBookmarkCtrl', ['$scope', '$modalInstance', 'NoteService', function($scope, $modalInstance, NoteService){
	
	$scope.items = [];
	$scope.hasBookmarkList = false;
	$scope.selected = {};
	$scope.selected.commentary = "";
	$scope.bookmarkError = 0;

	NoteService.getBookmarksList(
			function(data){
				$scope.bookmarkError = 0;
				$scope.items = data;
				$scope.selected = {
    				item: $scope.items[0]
  				};
  				$scope.selected.commentary = "";
			}, function(status){
				if(status == 404)
					$scope.bookmarkError = status;
				else if(status == 403)
					$scope.bookmarkError = status;
				else
					console.log("unknown error");
		});
}])
.controller('BookmarksController',[ '$scope', '$modal', 'arachneEntity', 'sessionService', 'NoteService',
	function ($scope, $modal, arachneEntity, sessionService, NoteService){

		$scope.bookmarksLists = [];
		$scope.bmStatus = 0;
		$scope.user = sessionService.user;

		this.logout = function () {
			sessionService.logout(function () {
				window.location.href = '';
			});
		}

		$scope.getBookmarkInfo = function(){
			NoteService.getBookmarkInfo($scope.bookmarksLists,
				function(data){
					console.log("Bookmark Info erhalten");
					for(var x in $scope.bookmarksLists){						//durchlaue Bookmarks
						for(var y in $scope.bookmarksLists[x].bookmarks){
							for(var z in data.entities){						//sortiere entity infos in die bookmarks ein
								if($scope.bookmarksLists[x].bookmarks[y].arachneEntityId == data.entities[z].entityId)
								{
									$scope.bookmarksLists[x].bookmarks[y].title = data.entities[z].title;
									$scope.bookmarksLists[x].bookmarks[y].entityId = data.entities[z].entityId;
									$scope.bookmarksLists[x].bookmarks[y].thumbnailId = data.entities[z].thumbnailId;
								}
							}
						}
					}

					console.log($scope.bookmarksLists);
				}, function(status){
						console.log("getboomarkInfo error:" + status);
				}
			);
		}

		$scope.refreshBookmarkLists = function(){
			NoteService.getBookmarksList(
				function(data){
					$scope.bookmarksLists = data;
					$scope.bookmarksLists.notEmpty = true;
					$scope.bmStatus = 0;
					console.log("BookmarksList erhalten");
					$scope.getBookmarkInfo();
				}, function(status){
					console.log(status);
				}
			);
		}

		$scope.refreshBookmarkLists();
		
		$scope.deleteBookmark = function(bookmark){
			NoteService.deleteBookmark(bookmark.id,
				function(data){
					console.log("deleted Bookmark" + data);
					$scope.refreshBookmarkLists();
				}, function(response){
					console.log("error deleting Bookmark" + response.status);
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
			NoteService.getBookmark(id,
				function(data){
					console.log("got Bookmark" + data);
					bm = data;
					bm.commentary = commentary;

					NoteService.updateBookmark(bm, id,
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

		$scope.deleteBookmarksListModal = function(id, name){
			var id = id;
			var name = name;
			
			var modalInstance = $modal.open({
				templateUrl: 'deleteBookmarksList.html'
			});	
			modalInstance.close = function(){
				modalInstance.dismiss();
				$scope.deleteBookmarksList(id);
			}
		}

		$scope.createBookmarksListModal = function(){
			var modalInstance = $modal.open({
				templateUrl: 'createBookmarksList.html'
			});	

			modalInstance.close = function(name, commentary){
				if(name == undefined || name == ""){
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

			NoteService.createBookmarksList(list, 
				function(response){
					console.log("creating BookmarksList" + response);
				},
				function(response){
					console.log("Error creating BookmarksList" + response.status);
					$scope.bmStatus = status;
				});
			$scope.refreshBookmarkLists();
		}

		$scope.deleteBookmarksList = function(id){
			NoteService.deleteBookmarksList(id,
				function(data){
					console.log("deleted List" + data);
					$scope.refreshBookmarkLists();
				}, function(status){
					console.log("error deleting list" + status);
					$scope.bmStatus = status;
				});	
		}
}])
.controller('EntityImgCtrl', ['$routeParams', '$scope', 'sessionService', 'arachneEntity', '$modal', 'arachneSettings',
	function ($routeParams, $scope, sessionService, arachneEntity, $modal, arachneSettings) {
		if($routeParams.entityId) {
			$scope.previousImage = null;
		}
		$scope.user = sessionService.user;
		$scope.entityId = $routeParams.imageId;
		$scope.dataserviceUri = arachneSettings.dataserviceUri;


	  //GALLERY METHODS
		this.loadImageProperties = function () {
			$scope.imageProperties = arachneEntity.getImageProperties({id: $scope.entityId});
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
	  //METAINFO
		this.getImageEntityForMetainfos = function () {
			if(!$scope.imageEntity) {
				$scope.imageEntity = arachneEntity.getEntityById($routeParams.imageId);
			} else {

			}
			var modalInstance = $modal.open({
				templateUrl: 'metainfos.html',
				scope: $scope
			});	
			modalInstance.close = function(){
				modalInstance.dismiss();
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
}])
.controller('NewsController', ['$scope', 'newsFactory', 'teaserFactory', 'arachneSearch', function ($scope, newsFactory, teaserFactory, arachneSearch) {

		$scope.screenHeight = window.outerHeight-480;
		$scope.selection = 'search';
		var hash = new Object();
		hash.q = "*";

		$scope.categoryStarts = [
			{
				imageId : 424501,
				title : "Bauwerke",
				description :'Gebäude oder Monumente, die auch übergeordnete Kontexte zu einem Einzelobjekt oder einem mehrteiligen Denkmal sein können.',
				customlink : "category/?q=*&fq=facet_kategorie:bauwerk&fl=1500"
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
				customlink : "category/?q=*&fq=facet_kategorie:buch&fl=1500"
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

		this.loadTeaser = function(){
			if($scope.projectList == null)	
	    		teaserFactory.getTeaser().success(function(data) {$scope.projectList = data;})
		}
}])
.run(function($rootScope, $location) {
    $rootScope.location = $location;
});

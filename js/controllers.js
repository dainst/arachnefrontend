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
			//console.log("open complete");	    
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
			$scope.onSelectPage = function (p) {
				$scope.currentPage = p;
				arachneSearch.goToPage(p);
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
		this.goToResultNr = function(number) {

			/*if((number > 0) && (number!=$scope.resultIndex) && (number < $scope.nextEntitySearch.size)){
				arachneSearch.setResultIndex(number)
				var qHash = angular.copy(arachneSearch.getCurrentQueryParameters());
					qHash.resultIndex = arachneSearch.getResultIndex();
				$location.url("entity/" + $scope.nextEntitySearch.entities[0].entityId).search(qHash);
			}*/
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

		$scope.queryBookmarListsForEntityId = function(){
			$scope.bookmarklists = NoteService.queryBookmarListsForEntityId($routeParams.id);
		}

		$scope.updateBookmarkModal= function(id, commentary){
			$scope.commentaryCash = commentary;
			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/updateBookmarkModal.html',
				scope: $scope
			});	

			modalInstance.close = function(commentaryCash){
				if(commentaryCash == undefined || commentaryCash == ""){
					alert("Kommentar setzen!")
				} else {
					modalInstance.dismiss();
					$scope.updateBookmark(id, commentaryCash);
				}
			}
		}

		$scope.updateBookmark = function(id, commentary){
			var bm = new Object();

			NoteService.getBookmark(id,
				function(data){
					bm = data;
					bm.commentary = commentary;

					NoteService.updateBookmark(bm, id, function(data){
							//updated BM,... what happens then?
						},function(status){
							//failed to update BM,... implementation needed
						});

					$scope.queryBookmarListsForEntityId();
				}, function(status){
					//console.log("error getting Bookmark" + status);
				});	
		}

		$scope.deleteBookmark = function(bookmarkId){
			NoteService.deleteBookmark(bookmarkId,
			function(data){
				$scope.queryBookmarListsForEntityId();
			});	
		}

		$scope.createBookmarkModal = function(){
			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/createBookmark.html',
				controller: 'createBookmarkCtrl',
      		});

      		modalInstance.result.then(function (selectedList) { 
      			if(selectedList.commentary == undefined || selectedList.commentary == "")
      				selectedList.commentary = "no comment set";

      			var bm = {
					arachneEntityId : $routeParams.id,
					commentary : selectedList.commentary
				}
				NoteService.createBookmark(bm, selectedList.item.id, function(data){
					$scope.queryBookmarListsForEntityId();
				});
      		});
		}
		$scope.createBookmark = function(){
			NoteService.getBookmarksLists(
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
								NoteService.createBookmarksList(list,
									function(data){
										$scope.createBookmarkModal();
									});
							}
						}
					}
					
					if(data.length >= 1)
						$scope.createBookmarkModal();
				}
			);
			
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
		console.log(arachneEntity.getEntityById($routeParams.id));
		$scope.specialNavigations = arachneEntity.getSpecialNavigations($routeParams.id);

		$scope.context = arachneEntity.getContext({id:$routeParams.id});
		console.log(arachneEntity.getContext({id:$routeParams.id}));

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
.controller('BookmarksController',[ '$scope', '$modal', 'arachneEntity', 'sessionService', 'NoteService',
	function ($scope, $modal, arachneEntity, sessionService, NoteService){

		$scope.bookmarksLists = [];
		$scope.user = sessionService.user;

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
				function(){
					$scope.getBookmarkInfo();
				}
			);
		}

		$scope.refreshBookmarkLists();
		
		$scope.deleteBookmark = function(bookmark){
			NoteService.deleteBookmark(bookmark.id,
				function(data){
					$scope.refreshBookmarkLists();
				});
		}

		$scope.updateBookmarkModal= function(id, commentary){
			$scope.commentaryCash = commentary;
			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/updateBookmarkModal.html',
				scope: $scope
			});	

			modalInstance.close = function(commentaryCash){
				if(commentaryCash == undefined || commentaryCash == ""){
					alert("Kommentar setzen!")
				} else {
					modalInstance.dismiss();
					$scope.updateBookmark(id, commentaryCash);
				}
			}
		}

		$scope.updateBookmark = function(id, commentary){
			var bm = new Object();

			NoteService.getBookmark(id,
				function(data){
					bm = data;
					bm.commentary = commentary;

					NoteService.updateBookmark(bm, id, function(data){
							//console.log("updated bookmark");

						},function(status){
							//console.log("update failed" + status);
						});

					$scope.refreshBookmarkLists();
				}, function(status){
					//console.log("error getting Bookmark" + status);
				});	
		}

		$scope.deleteBookmarksListModal = function(id, name){
			var id = id;
			var name = name;
			
			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/deleteBookmarksList.html'
			});	
			modalInstance.close = function(){
				modalInstance.dismiss();
				$scope.deleteBookmarksList(id);
			}
		}

		$scope.createBookmarksListModal = function(){
			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/createBookmarksList.html'
			});	

			modalInstance.close = function(name, commentary){
				commentary = typeof commentary !== 'undefined' ? commentary : "";
				if(name == undefined || name == "") {
					alert("Bitte Titel eintragen.")							
				} else {
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

			$scope.bookmarksLists.push(NoteService.createBookmarksList(list, 
				function(response){
					// console.log("creating BookmarksList" + response);
					$scope.refreshBookmarkLists();
				},
				function(response){
					// console.log("Error creating BookmarksList" + response.status);
					$scope.bmStatus = status;
				}));
		}

		$scope.deleteBookmarksList = function(id){
			NoteService.deleteBookmarksList(id,
				function(data){
					// console.log("deleted List" + data);
					$scope.refreshBookmarkLists();
				}, function(status){
					// console.log("error deleting list" + status);
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
				templateUrl: 'partials/Modals/metainfos.html',
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
}]);

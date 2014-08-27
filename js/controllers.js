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
	['arachneSearch', '$scope', '$route', '$timeout', /*'arachneSettings',*/
	function ( arachneSearch, $scope, $route, $timeout) {
		var currentTemplateURL = $route.current.templateUrl;

		$scope.activeFacets = arachneSearch.getActiveFacets();
		$scope.currentQueryParameters = arachneSearch.getCurrentQueryParameters();

		this.addFacet = function (facetName, facetValue) {
			arachneSearch.addFacet(facetName, facetValue);	
		}

		this.removeFacet = function (facet) {
			arachneSearch.removeFacet(facet);
		}

	// mouse effects for magnifier

		var  timer = null;
		this.startTimer = function (event) {
			var image = event.target;
			
			//break if image is just a placeholder
			if (image.getAttribute('placeholder')) return;

			if (!timer) {
				timer = $timeout( function () {
					if(image.parentNode.children.length==1) {
						// inject the magnifier element that uses the large image as background
						var viewerElement = document.createElement("DIV");
						viewerElement.className = "magnifier";
						viewerElement.style.backgroundImage = "url('"+ image.getAttribute('largeimage') + "')";
						image.parentNode.appendChild(viewerElement);

						image.parentNode.onmousemove = $scope.onMouseMove;
						// viewerElement.style.visibility = 'visible';
						$scope.onMouseMove(event);

						// the usage of pointer-events:none; on the viewer element!
						// ...we need to hide the cursor of the image
						image.style.cursor = 'none';
					} else {
						// the magnifier element already has been injected 
						image.parentNode.children[1].style.visibility = 'visible';
					}

				}, 1000);
			}
		}

		this.endTimer = function(event) {			
			if (timer != null) {
				$timeout.cancel( timer );
				timer = null;
			}
			// remove magnifier
				// the usage of pointer-events:none; on the viewer element ensures:
				// that no mouse events get triggered by the viewer which would call this endTimer method
			if (event.target.parentNode.children.length==2) {
				event.target.parentNode.children[1].style.visibility = 'hidden';

			}
		}


		$scope.onMouseMove = function(event){
			
			var wrapper, image, magnifier;

			if(this) {
				wrapper = event.target.parentNode;
				image = event.target.parentNode.children[0];
				magnifier = event.target.parentNode.children[1];
			} else {
				wrapper =  this;
				magnifier = wrapper.children[1];
				image = wrapper.children[0];
			}

			var pageOffset = $scope.getPageOffset();
			var imagePosition = $scope.getElementPosition(image);

			var imgWidth = image.clientWidth;
			var imgHeight = image.clientHeight;
			
			if (imagePosition.x <= (event.clientX + pageOffset.x) && 
				imagePosition.y <= (event.clientY + pageOffset.y) && 
				imagePosition.x + imgWidth >= (event.clientX + pageOffset.x) && 
				imagePosition.y + imgHeight >= (event.clientY + pageOffset.y)){
				
				magnifier.style.visibility = 'visible';
				var x = event.clientX;
				var y = event.clientY;

				magnifier.style.left = (x - (magnifier.clientWidth / 2)) + "px";
				magnifier.style.top = (y - (magnifier.clientHeight / 2)) + "px";

				var srcX = x - imagePosition.x + pageOffset.x;
				var srcY = y - imagePosition.y + pageOffset.y;
				
				var backgroundImageXpos = srcX/(imgWidth/100);
				var backgroundImageYpos = srcY/(imgHeight/100);

				magnifier.style.backgroundPosition = backgroundImageXpos + "% " + backgroundImageYpos +  "%";

			} else {
				magnifier.style.visibility = 'hidden';
			}	
		}

		$scope.getPageOffset = function () {
			var scrOfX = 0, scrOfY = 0;
			if (typeof(window.pageYOffset) == 'number') {
				scrOfX = window.pageXOffset;
				scrOfY = window.pageYOffset;
			} else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
				scrOfX = document.body.scrollLeft;
				scrOfY = document.body.scrollTop;
			} else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
				scrOfX = document.documentElement.scrollLeft;
				scrOfY = document.documentElement.scrollTop;
			}

			return {x: scrOfX, y: scrOfY};
		}

		$scope.getElementPosition = function(obj){
			var curentLeft = 0, currentTop = 0;
			if (obj.offsetParent) {
				do {
					curentLeft += obj.offsetLeft;
					currentTop += obj.offsetTop;
				} while (obj = obj.offsetParent);
			}
			return {x: curentLeft, y: currentTop};
		}

	// (end) mouse effects for magnifier


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

		$scope.selection = 'search';
		var hash = new Object();
		hash.q = "*";

		$scope.categorySub = [
			{
				title : "Reproduktionen",
				description :'Reproduktionen',
				customlink : "category/?q=*&fq=facet_kategorie:Reproduktionen&fl=1500"
			},
			{
				title : "Typus",
				description :'Typus',
				customlink : "category/?q=*&fq=facet_kategorie:Typen&fl=1500"
			},
			{
				title : "Einzelmotive",
				description :'Einzelmotive',
				customlink : "category/?q=*&fq=facet_kategorie:Einzelmotive&fl=1500"
			},
			{
				title : "Mehrteilige-Denkmäler",
				description :'Mehrteilige-Denkmäler',
				customlink : "category/?q=*&fq=facet_kategorie:Mehrteilige Denkmäler&fl=1500"
			},
			{
				title : "Inschriften",
				description :'Inschriften',
				customlink : "category/?q=*&fq=facet_kategorie:Inschriften&fl=1500"
			},
			{
				title : "Buchseiten",
				description :'Buchseiten',
				customlink : "category/?q=*&fq=facet_kategorie:Buchseiten&fl=1500"
			}
			];

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
				customlink : "category/?q=*&fq=facet_kategorie:Bauwerksteile&fl=1500"
			},
			{
				imageId : 158019,
				title : "Objekte",
				description :'Objekte der realen Welt, die keine mehrteiligen Denkmäler, Bauwerke oder Topographien sind.',
				customlink : "category/?q=*&fq=facet_kategorie:Einzelobjekte&fl=1500"
			},
			{
				imageId : 1922705,
				title : "Szenen",
				description :'Thematisch oder formal in sich geschlossene Sektion einer Figurenfolge, die sich im Kontext eines Trägermediums befindet.',
				customlink : "category/?q=*&fq=facet_kategorie:Szenen&fl=1500"
			},
			{
				imageId : 46777,
				title : "Bilder",
				description :'Hier haben Sie die Möglichkeit gezielt nach Bildern und bildspezifischen Informationen (z.B. Fotografen ...) zu suchen. Diese Suche erfasst alle Bildbestände in Arachne.',
				customlink : "category/?q=*&fq=facet_kategorie:Bilder&fl=1500"
			},
			{
				imageId : 230879,
				title : "Bücher",
				description :'Bücherbestände der Arachne.',
				customlink : "category/?q=*&fq=facet_kategorie:Bücher&fl=1500"
			},
			{
				imageId : 433041,
				title : "Sammlungen",
				description :'Privat- und Museumssammlungen, die in Gebäuden residieren und Objekte bzw. mehrteilige Denkmäler oder deren Reproduktionen und Rezeptionen enthalten können.',
				customlink : "category/?q=*&fq=facet_kategorie:Sammlungen&fl=1500"
			},
			{
				imageId : 3099823,
				title : "Topographien",
				description :'Übergeordnete Kontexte, die untergeordnete topographische Einheiten, Gebäude oder Objekte der realen Welt inkorporieren. Von Bauwerken abgegrenzt werden topographische Einheiten, wenn mehr als ein Bauwerk vorhanden ist - konstitutiv sind Bauwerke für topographische Einheiten jedoch nicht.',
				customlink : "category/?q=*&fq=facet_kategorie:Topographien&fl=1500"
			},
			{
				imageId : 251347,
				title : "Rezeptionen",
				description :'Spezifische Wahrnehmungen antiker Objekte in bestimmten neuzeitlichen Rezeptionsquellen.',
				customlink : "category/?q=*&fq=facet_kategorie:Rezeptionen&fl=1500"
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

'use strict';

/* Controllers */

angular.module('arachne.controllers', ['ui.bootstrap'])
.controller('MenuCtrl',
	[ '$scope', '$modal', '$log', 'sessionService',
	function ($scope,  $modal, $log, sessionService){
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
	['$scope', '$modalInstance', 'sessionService', 'md5Filter',
	function($scope, $modalInstance, sessionService, md5Filter){
		$scope.loginData = {};
		$scope.user = sessionService.user;
		$scope.login = function () {
			sessionService.login(
				{user: $scope.loginData.user, password: md5Filter($scope.loginData.password)}
				,
	            function(res) {
	                console.log("eingeloggt");
	            },
	            function(err) {
	                console.log("nicht eingeloggt");
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

		$scope.activeFacets = arachneSearch.activeFacets;
		$scope.currentQueryParameters = arachneSearch.currentQueryParameters;

		this.addFacet = function (facetName, facetValue) {
			arachneSearch.addFacet(facetName, facetValue);	
		}

		this.removeFacet = function (facet) {
			arachneSearch.removeFacet(facet);
		}

		if (currentTemplateURL == 'partials/category.html' || currentTemplateURL == 'partials/map.html') {
			$scope.searchresults = arachneSearch.getMarkers();
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
	['$routeParams', 'arachneSearch', '$scope', '$modal', 'arachneEntity', 'bookmarksFactory',
	function ( $routeParams, arachneSearch, $scope, $modal, arachneEntity,bookmarksFactory ) {

		$scope.currentQueryParameters = arachneSearch.currentQueryParameters;
		$scope.isArray = function(value) {
			return angular.isArray(value);
		}
		$scope.typeOf = function(input) {
			var result = typeof input;
			console.log(input);
			return result;
		}
		
		$scope.loadFacetValue = function (facetValue) {
			if (!facetValue.entities.length) facetValue.entities = arachneSearch.getContextualEntities({id :$routeParams.id, fq: 'facet_kategorie:' + facetValue.facetValueName});
		}

		$scope.entity = arachneEntity.get({id:$routeParams.id});
		$scope.context = arachneSearch.getContext({id:$routeParams.id});
		$scope.isBookmark = false;

		$scope.resultIndex = arachneSearch.resultIndex;
		if(arachneSearch.resultIndex != null) {
			var queryhash = arachneSearch.currentQueryParameters;
			queryhash.limit = 1;
			queryhash.offset = arachneSearch.resultIndex+1;
			$scope.nextEntitySearch = arachneSearch.search(queryhash);
			queryhash.offset = arachneSearch.resultIndex-1;
			if(queryhash.offset >= 0) $scope.previousEntitySearch = arachneSearch.search(queryhash);
		}
		$scope.setResultIndex = function (resultIndex) {
			arachneSearch.setResultIndex(resultIndex);
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

		$scope.reloadBM();

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
.controller('NewsController', ['$scope', 'newsFactory', 'teaserFactory', 'arachneSearch', function ($scope, newsFactory, teaserFactory, arachneSearch) {
	$scope.items = ['search', 'youtube', 'news'];
	$scope.selection = $scope.items[0]		

	var hash = new Object();
	hash.q = "*";
	hash.fl= "500";
	$scope.search = arachneSearch.getMarkers(hash);

	newsFactory.getNews().success(function(data) { $scope.newsList = data;})		
	teaserFactory.getTeaser().success(function(data) {$scope.teaserList = data;})
}])
.controller('BookmarksController',[ '$scope', 'bookmarksFactory', '$modal', 'arachneEntity',
	function ($scope, bookmarksFactory, $modal, arachneEntity){

		$scope.bookmarksLists = [];
		$scope.bmStatus = 0;
		$scope.bE = []

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
.controller('EntityImgCtrl', ['$routeParams', '$scope', 'arachneEntityImg', 
		function ($routeParams, $scope, arachneEntityImg) {
		arachneEntityImg.getXml({id:$routeParams.id}).success(function(data) { 
			var xml = data;
			
			$scope.id = {id:$routeParams.id}.id;
			var width = xml.substring(xml.indexOf("WIDTH=\"")+7);
			$scope.width = width.substring(0, width.indexOf("\""));
			var height = xml.substring(xml.indexOf("HEIGHT=\"")+8);
			$scope.height = height.substring(0, height.indexOf("\""));
			var tile = xml.substring(xml.indexOf("TILESIZE=\"")+10);
			$scope.tilesize = tile.substring(0, tile.indexOf("\""));

			// console.log($scope.id);
			// console.log($scope.height);
			// console.log($scope.width);
			// console.log($scope.tilesize);
		})
		$scope.imgID = $routeParams.id; 	
}])
.controller('NewsController', ['$scope', 'newsFactory', 'teaserFactory', 'arachneSearch', function ($scope, newsFactory, teaserFactory, arachneSearch) {

	$scope.selection = 'search';
	var hash = new Object();
	hash.q = "*";
	hash.fl= "1500";

	$scope.search = arachneSearch.getMarkers(hash);

	newsFactory.getNews().success(function(data) { $scope.newsList = data;})		
	teaserFactory.getTeaser().success(function(data) {$scope.teaserList = data;})
}]);

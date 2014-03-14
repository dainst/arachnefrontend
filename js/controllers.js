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
			$scope.searchresults = arachneSearch.executeSearch();
		}

}
]
)
.controller('EntityCtrl',
	['$routeParams', 'arachneSearch', '$scope', '$modal', 'arachneEntity', 'bookmarksFactory',
	function ( $routeParams, arachneSearch, $scope, $modal, arachneEntity,bookmarksFactory ) {
		if(typeof $scope.currentSearch !== "undefined" && $scope.currentSearch !== null) {
			$scope.currentSearch = arachneSearch.currentSearch;
		} else {
			$scope.currentSearch = JSON.parse(localStorage.getItem('currentSearch'));
		}
		$scope.isArray = function(value) {
			return angular.isArray(value);
		}
		$scope.typeOf = function(input) {
			var result = typeof input;
			console.log(input);
			return result;
		}

		$scope.entity = arachneEntity.get({id:$routeParams.id});

		$scope.isBookmark = false;
		$scope.bookmark = {};

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

	bookmarksFactory.getBookmarksList(
			function(data){
				$scope.items = data;
				$scope.selected = {
    				item: $scope.items[0]
  				};
  				$scope.selected.commentary = "commentary";
			}, function(status){
				if(status == 404)
					$scope.bookmarkError = "noList";
				else if(status == 403)
					$scope.bookmarkError = "noLogin";
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
.controller('BookmarksController',[ '$scope', 'bookmarksFactory', '$modal',
	function ($scope, bookmarksFactory, $modal){

		$scope.bookmarksLists = [];

		$scope.refreshBookmarkLists = function(){
			bookmarksFactory.getBookmarksList(
				function(data){
					$scope.bookmarksLists = data;
					$scope.bookmarksLists.notEmpty = true;
					console.log("BookmarksList erhalten");
				}, function(status){
					if(status == 404)
					{
						$scope.bookmarksLists = [];
					}
					else if(status == 403)
					{
						$scope.bookmarksLists = [];
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
					console.log("error creating list"+ status);
				});
			
		}

		$scope.deleteBookmarksList = function(id){
			bookmarksFactory.deleteBookmarksList(id,
				function(data){
					console.log("deleted List" + data);
					$scope.refreshBookmarkLists();
				}, function(status){
					console.log("error deleting list" + status);
				});
			
		}
}])
.controller('EntityImgCtrl', ['$routeParams', '$scope', 'arachneEntityImg', 
		function ($routeParams, $scope, arachneEntityImg) {
		//$scope.img = arachneEntityImg.get({id:$routeParams.id});
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

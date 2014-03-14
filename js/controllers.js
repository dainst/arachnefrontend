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


		this.addFacet = function (facetName, facetValue) {
			arachneSearch.addFacet(facetName, facetValue);	
		}

		this.removeFacet = function (facet) {
			arachneSearch.removeFacet(facet);
		}

		if (currentTemplateURL == 'partials/filter.html' || currentTemplateURL == 'partials/map.html') {
			$scope.searchresults = arachneSearch.getMarkers();
		} else {
			$scope.searchresults = arachneSearch.executeSearch();
		}

}
]
)
.controller('EntityCtrl',
	['$routeParams', 'arachneSearch', '$scope', '$modal', 'arachneEntity',
	function ( $routeParams, arachneSearch, $scope, $modal, arachneEntity) {
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
		$scope.bookmarks = ['test', 'Rom', 'Berlin'];
		$scope.selectedBK = 'test';
  		//$scope.bookmarkSelected = $scope.bookmarks[2];
		$scope.openBookmarkModal = function () {
			var modalInstance = $modal.open({
				templateUrl: 'bookmarkForm.html'
			});				    
		};
		console.log($scope.entity);
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

	angular.extend($scope, {
		defaults: {
			tileLayer: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
			minZoom: 0,
			maxZoom: 18,
			scrollWheelZoom: true
		},
		layers: {
			baselayers: {
				xyz: {
					name: 'OpenStreetMap (XYZ)',
					url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
					type: 'xyz'
				}
			},
			overlays: {
				locs: {                           
					name: "Markers",
					type: "markercluster",
					visible: true
				}
			}
		}
	})
}])
.controller('BookmarksController',[ '$scope', 'bookmarksFactory', '$modal',
	function ($scope, bookmarksFactory, $modal){

		$scope.bookmarksLists = [];
		bookmarksFactory.checkEntity("2202");

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
						//$scope.createBookmarksListModal(false);
					}
				}
			);
		}

		$scope.refreshBookmarkLists();
		/*
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
			
		}*/
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

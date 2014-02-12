'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
	.controller('SearchCtrl',
		['$location', 'arachneSearch', '$scope', 
			function ( $location, arachneSearch, $scope) {


				this.parseUrlFQ = function (fqParam) {
					var facets = [];
					fqParam = fqParam.split(/\"\,/);
					for (var i = fqParam.length - 1; i >= 0; i--) {
						var facetNameAndVal = fqParam[i].replace(/"/g,'').split(':');

						facets.push({
							name: facetNameAndVal[0],
							value: facetNameAndVal[1]
						});
					};
					return facets;
				};

				$scope.activeFacets = $location.$$search.fq ? this.parseUrlFQ($location.$$search.fq) : [];

				this.append = function () {
					var hash = $location.$$search;

					if (hash.offset) {
						hash.offset = parseInt(hash.offset)+50;
					} else {
						hash.offset = 50;
					}
					$scope.search = arachneSearch.executeSearch(hash);
					
				};


				$scope.search = arachneSearch.executeSearch($location.$$search);

				this.addFacet = function (facetName, facetValue) {
					//Check if facet is already included
					for (var i = $scope.activeFacets.length - 1; i >= 0; i--) {
						if ($scope.activeFacets[i].name == facetName) return;
					};

					var hash = $location.$$search;

					if (hash.fq) {
						hash.fq += "," + facetName + ':"' + facetValue + '"';
					} else {
						hash.fq = facetName + ':"' + facetValue + '"';
					}

					$scope.results = [];
					$location.search(hash);
				}

				this.removeFacet = function (facet) {
					for (var i = $scope.activeFacets.length - 1; i >= 0; i--) {
						if ($scope.activeFacets[i].name == facet.name) {
							$scope.activeFacets.splice(i,1);
						}
					};
					$scope.results = [];
					var facets = $scope.activeFacets.map(function(facet){
    					return facet.name + ':"' + facet.value + '"';
					}).join(",");
					var hash = $location.$$search;
					hash.fq = facets;
					$location.search(hash);
				}
			}
		]
	)
	.controller('EntityCtrl',
		['$routeParams', 'arachneSearch', '$scope', 'arachneEntity',
			function ( $routeParams, arachneSearch, $scope, arachneEntity) {
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
				

			}
		]
	);

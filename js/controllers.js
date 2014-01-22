'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
	controller('MyCtrl1', [function() {

	}])
	.controller('MyCtrl2', [function() {

	}])
	.controller('SearchCtrl',
		['$location', 'arachneSearch', '$scope', 
			function ( $location, arachneSearch, $scope) {

				$scope.results = [];
				$scope.facets = [];
				$scope.activeFacets = $location.$$search.fq.split(',');


				this.executeSearch = function (locationHash) {
					$scope.search = arachneSearch.query(locationHash,function(data){
						$scope.results.push.apply($scope.results, data.entities);
						
					});
				};
				

				this.append = function () {
					var hash = $location.$$search;

					if (hash.offset) {
						hash.offset = parseInt(hash.offset)+50;
					} else {
						hash.offset = 50;
					}
					this.executeSearch(hash)
					
				};


				this.executeSearch($location.$$search);

				this.addFacet = function (facetName, facetValue) {
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
						if ($scope.activeFacets[i] == facet) {
							$scope.activeFacets.splice(i,1);
						}
					};
					$scope.results = [];
					var facets = $scope.activeFacets.join(',');
					var hash = $location.$$search;
					hash.fq = facets;
					$location.search(hash);
				}
			}
		]
	);

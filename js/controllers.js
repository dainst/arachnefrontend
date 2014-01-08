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

				this.executeSearch = function (locationHash) {
					$scope.search = arachneSearch.query(locationHash,function(data){
						$scope.results.push.apply($scope.results, data.entities);

					});
				};
				

				this.append = function () {
					var hash = $location.$$search;

					hash.offset = parseInt(hash.offset)+20;
					this.executeSearch(hash)
					
				};


				this.executeSearch($location.$$search);


			}
		]
	);

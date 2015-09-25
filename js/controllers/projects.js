'use strict';

angular.module('arachne.controllers')


/**
 * $scope
 *   columns - an array of 3 elements which each
 *   represent a column of project items.
 *
 * @see: ../docs/feature_localization_con10t.md
 * @see: ../spec/controllers_projects_spec.js 
 *
 * @author: Daniel M. de Oliveira
 * @author: Sebastian Cuy
 */
.controller('ProjectsController', ['$scope', '$http', 'localizedContent',
	function ($scope, $http, localizedContent) {

		var PROJECTS_JSON = 'con10t/content.json';

		$scope.columns = [];
		var projects=[];
		var sliceColumns = function(){
			$scope.columns[0] = projects.slice(0,3);
			$scope.columns[1] = projects.slice(3,5);
			$scope.columns[2] = projects.slice(5);
		}

		$http.get(PROJECTS_JSON).success(function(data){
			localizedContent.reduceTitles(data);
			projects = data.children;
			sliceColumns();
		});
	}
]);

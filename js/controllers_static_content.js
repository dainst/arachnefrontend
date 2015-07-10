'use strict';

angular.module('arachne.controllers')


/**
 * Sets the templateUrl for a localized static page.
 * The version of the static page gets determined
 * by specification by the user via search param lang 
 * or otherwise by an automatic language selection rule.
 *
 * Depending on the first part of the route (/info,/project),
 * it serves the contents of either the static/ or con10t/
 * directories.
 *
 * $scope
 *   templateUrl
 *
 * @author: Sebastian Cuy
 * @author: Daniel M. de Oliveira
 */

.controller('StaticContentController', ['$scope', '$routeParams', '$http', '$location', 'localizedContent',
function ($scope, $routeParams, $http, $location, localizedContent) {

	var CONTENT_URL = '{LOCATION}/{LANG}/{NAME}.html';

	// ## ROUTE TO CONTENT MAPPING ##

	var toc_json = ''; // used for language auto-selection.
	var content_url = '';

	if ($location.path().indexOf('/info')==0){
		toc_json = 'static/top.json';
		content_url = CONTENT_URL.replace('{LOCATION}','static');
	}else{
		toc_json = 'con10t/projects.json';
		content_url = CONTENT_URL.replace('{LOCATION}','con10t');
	}
	content_url = content_url.replace('{NAME}',$routeParams.name);


	if ($location.search()['lang']!=undefined){

		$scope.templateUrl = content_url.replace('{LANG}',$location.search()['lang']);

	} else {

		$http.get(toc_json).success(function (data) {
			var lang = localizedContent.determineLanguage(data[0], $routeParams.name);
			$scope.templateUrl = content_url.replace('{LANG}', lang);
		});
	}

}]);
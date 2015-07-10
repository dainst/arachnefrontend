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
	var CONTENT_TOC = '{LOCATION}/projects.json'

	// Map route to contentDir
	var contentDir = '';
	if ($location.path().indexOf('/info')==0)
		contentDir = 'static';
	else
		contentDir = 'con10t';

	var content_url = CONTENT_URL.
		replace('{NAME}',$routeParams.name).
		replace('{LOCATION}',contentDir);


	if ($location.search()['lang']!=undefined){

		$scope.templateUrl = content_url.replace('{LANG}',$location.search()['lang']);

	} else {

		$http.get(CONTENT_TOC.replace('{LOCATION}',contentDir)).success(function (data) {
			var lang = localizedContent.determineLanguage(data[0], $routeParams.name);
			$scope.templateUrl = content_url.replace('{LANG}', lang);
		});
	}
}]);

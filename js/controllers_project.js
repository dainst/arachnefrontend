'use strict';

angular.module('arachne.controllers')


/**
 * Sets the templateUrl for a localized project page.
 * The version of the project page gets determined
 * by specification by the user via search param lang 
 * or otherwise by an automatic language selection rule.
 * 
 * $scope
 *   templateUrl
 *
 * @author: Sebastian Cuy
 * @author: Daniel M. de Oliveira
 */

.controller('ProjectController', ['$scope', '$routeParams', '$http', '$location', 'language', 'languageSelection',
function ($scope, $routeParams, $http, $location, language, languageSelection) {

	var PROJECTS_JSON = 'con10t/projects.json';
	var CON10T_URL = 'con10t/{LANG}/{NAME}.html';

	var con10tUrl = CON10T_URL.replace('{NAME}',$routeParams.name);

	var isProjectSiteAvailableForLang = function(lang,project) {
		var recursive = function(project){
			if (project.id==$routeParams.name&&project.title[lang]) return true;
			if (project.children) 
				for (var i=0; i< project.children.length;i++)
					if (recursive(project.children[i])) return true;
			return false;
		}  
		if (recursive(project)) return true;
		return false;
	}

	var setTemplateUrlForLang = function(lang,projects) {
		$scope.templateUrl=con10tUrl.replace('{LANG}',lang);
	}

    
	if ($location.search()['lang']==undefined){
		$http.get(PROJECTS_JSON).success(function(data){
			languageSelection.__ (language.__(),isProjectSiteAvailableForLang,setTemplateUrlForLang,data[0]);
		});
	}
	else
		$scope.templateUrl = con10tUrl.replace('{LANG}',$location.search()['lang']);
}]);
'use strict';

angular.module('arachne.controllers')

/**
 * Handles requests for the state of the document import.
 *
 * $scope variables:
 *   templateUrl
 *
 * @author: Daniel M. de Oliveira
 * @author: Sebastian Cuy
 */
.controller('ProjectController', ['$scope', '$routeParams', 'language', '$http',
    function ($scope, $routeParams, language, $http) {

		var GERMAN_LANG = 'de';
		var ENGLISH_LANG = 'en';
		
		var con10tIndexUrl = 'con10t/{LANG}/'+$routeParams.name+'.html';
		
		var setTemplateUrl = function(lang){
			$scope.templateUrl=con10tIndexUrl.replace('{LANG}',lang);
			return $scope.templateUrl;
		}
				
		var lang = language.__();
		if (language.__().substring(0,2)=='de') lang='de';
		if (language.__().substring(0,2)=='en') lang='en';
	

		
        $http.get(setTemplateUrl(lang))
         .error(function(){ // primary language not available
			 
			if (language.__().substring(0,2)==ENGLISH_LANG) 
				setTemplateUrl(GERMAN_LANG);
			else {
   				$http.get(setTemplateUrl(ENGLISH_LANG))
   			 	.error(function(){
   				 	setTemplateUrl(GERMAN_LANG);
   			 	});
			 }
         })
    }
]);
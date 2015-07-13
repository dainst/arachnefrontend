'use strict';

/* Directives */
angular.module('arachne.directives')


/** 
 * @author: Daniel M. de Oliveira
 */

.directive('arNavbar', function() {
return {
	restrict: 'E',
	scope: {},
	templateUrl: 'partials/directives/ar-navbar.html',
	controller: [ '$scope', '$http', 'localizedContent', 
		function($scope,$http, localizedContent) {
		$scope.getNavbarLinks = function(contentDir){
			$http.get(contentDir+'/content.json').success(function(data){
				var navbarLinks = localizedContent.getNodeById(data,'navbar');
				if (navbarLinks==undefined) {console.log('error: no navbarLinks found');}
				localizedContent.reduceTitles(navbarLinks)			
				$scope.dynamicLinkList=navbarLinks.children;
			});				
		}
		}],
	link: function(scope,element,attrs){
		scope.getNavbarLinks(attrs.contentDir);
	}
}});
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
		$scope.getTop = function(contentDir){
			$http.get(contentDir+'/projects.json').success(function(data){
				localizedContent.reduceTitles(data[0].children[0])			
				$scope.dynamicLinkList=data[0].children[0].children;
			});				
		}
		}],
	link: function(scope,element,attrs){
		scope.getTop(attrs.contentDir);
	}
}});
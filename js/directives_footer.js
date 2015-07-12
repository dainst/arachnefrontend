'use strict';

angular.module('arachne.directives')


/** 
 * @author: Daniel M. de Oliveira
 */

.directive('arFooter', function() {
return {
	restrict: 'E',
	scope: {},
	templateUrl: 'partials/directives/ar-footer.html',
	controller: [ '$scope', '$http', 'localizedContent', 
		function($scope,$http, localizedContent) {
		$scope.getTop = function(contentDir){
			$http.get(contentDir+'/projects.json').success(function(data){
				localizedContent.reduceTitles(data[0].children[1])		
				$scope.dynamicLinkList=data[0].children[1].children;
			});				
		}
		}],
	link: function(scope,element,attrs){
		scope.getTop(attrs.contentDir);
	}
}});
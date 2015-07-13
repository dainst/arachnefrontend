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
		$scope.getFooterLinks = function(contentDir){
			$http.get(contentDir+'/content.json').success(function(data){
				var footerLinks = localizedContent.getNodeById(data,'footer');
				if (footerLinks==undefined) {console.log('error: no footerLinks found');}
				localizedContent.reduceTitles(footerLinks)	
				$scope.dynamicLinkList=footerLinks.children;
			});				
		}
		}],
	link: function(scope,element,attrs){
		scope.getFooterLinks(attrs.contentDir);
	}
}});
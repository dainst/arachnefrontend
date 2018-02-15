'use strict';

angular.module('arachne.directives')

.directive('arScopedHref', ['searchScope', function (searchScope) {

	return {
		restrict: 'A',
		scope: {
			arScopedHref: '@'
		},
		link: function(scope, element, attrs) {
            scope.$watch(function() {
                attrs.$set('href', searchScope.currentScopePath() + scope.arScopedHref);
			});
		}
	}

}]);
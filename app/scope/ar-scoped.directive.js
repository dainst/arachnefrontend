'use strict';

angular.module('arachne.directives')

.directive('arScoped', ['searchScope', function (searchScope) {

	return {
		restrict: 'A',
		scope: {

		},
		link: function(scope, element) {
			console.log("!", element)
			element.href = '/ya/' + element.href;
		}
	}

}]);
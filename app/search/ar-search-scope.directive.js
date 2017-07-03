'use strict';
/**
 *  The interessting question was, should a click on the prjekt logo/name lead the user to the project page or to remove
 * the filter as the others do it. I think no body will understand why he leaves a project when he clicks, so I decided
 * to make the logo a link to the project page.
 *
 * I then spent a lot of time trying and thinking we need a "leave project / search everywhere"-button but in the end
 * why? what would the average DAU-archaelogical user do If he or she wants to search everywhere? click on the arachne
 * logo, nothing else.
 */
angular.module('arachne.directives')

	.directive('arSearchScope', ['$q', 'searchScope', function ($q, searchScope) {

		// preloads image and checks if exists
		function isImage(src) {

			var deferred = $q.defer();

			var image = new Image();
			image.onerror = function() {
				deferred.resolve(false);
			};
			image.onload = function() {
				deferred.resolve(true);
			};
			image.src = src;

			return deferred.promise;
		}




		return {
			scope: {
				scope: '='
			},
			templateUrl: 'app/search/ar-search-scope.html',
			link: function(scope, element) {

				// project page
				scope.projectPage = "/project/" + scope.scope;

				// project logo
				var imagePath = "/con10t/img/" + scope.scope + "/search-logo.jpg";
				scope.hasImage = false;
				scope.imagePath = '';

				isImage(imagePath).then(
					function(isImage) {
						if (isImage) {
							scope.imagePath = imagePath;
							scope.hasImage = true;
						} else {
							scope.imagePath = '';
							scope.hasImage = false;
						}
					}
				)

				// project title
				scope.name = scope.scope;
				scope.currentScopeTitle = searchScope.currentScopeTitle;

			}
		}
	}]);
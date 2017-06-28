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

	.directive('arSearchScope', ['$q', '$http', 'language', function ($q, $http, language) {

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

		function getLocalized(set) {
			var lang = language.currentLanguage();
			console.log(lang, set);
			if (typeof set[lang] !== "undefined") {
				return set[lang]
			} else {
				return set[Object.keys(set)[0]];
			}
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

				/**
				 * STAND
				 * - make sure, that content.json get loaded correctly and only once
				 * - correct language
				 * 
				 *
				 * @type {{}}
				 */


				// project title
				var titlesMap = {};
				scope.title = scope.scope;
				scope.getFullTitle = function getFullTitle() {
					function flatten(tree, map) {
						tree.map(function(branch) {
							map[branch.id] = branch.title;
							if (typeof branch.children !== "undefined") {
								flatten(branch.children, map);
							}
						});
					}


					scope.title =
						(typeof titlesMap[scope.scope] !== "undefined") &&
						(typeof titlesMap[scope.scope].de !== "undefined") ?
							getLocalized(titlesMap[scope.scope]) :
							scope.title;

					// if titlesMap not built yet, do it
					if (Object.keys(titlesMap).length === 0) {
						$http.get('con10t/content.json').then(function(response) {
							flatten([response.data], titlesMap);
							scope.getFullTitle(scope.scope)
						});
					}
				}

				scope.getFullTitle();


			}
		}
	}]);
'use strict';

angular.module('arachne.controllers')


/**
 * Sets the templateUrl for a localized static page.
 * The version of the static page gets determined
 * by specification by the user via search param lang
 * or otherwise by an automatic language selection rule.
 *
 * Depending on the first part of the route (/info,/project),
 * it serves the contents of either the static/ or con10t/
 * directories.
 *
 * $scope
 *   templateUrl
 *
 * @author: Sebastian Cuy
 * @author: Daniel M. de Oliveira
 * @author: Jan G. Wieners
 */

    .controller('StaticContentController', ['$scope', '$stateParams', '$http', '$location', 'localizedContent', '$timeout', '$templateCache',
        function ($scope, $stateParams, $http, $location, localizedContent, $timeout, $templateCache) {

            $scope.$on("$includeContentError", function (event, templateName) {
                $location.path('/404');
            });

            var CONTENT_URL = '{LOCATION}/{LANG}/{NAME}.html';
            var CONTENT_TOC = '{LOCATION}/content.json';

            // Map route to contentDir
            var contentDir = '';
            if ($location.path().indexOf('/info') == 0)
                contentDir = 'info';
            else
                contentDir = 'con10t';

            var content_url = CONTENT_URL.replace('{NAME}', $stateParams.title).replace('{LOCATION}', contentDir);

            if ($location.search()['lang'] != undefined) {

                $scope.templateUrl = content_url.replace('{LANG}', $location.search()['lang']);

                // Ensure that images are loaded correctly
                $templateCache.remove($scope.templateUrl);

            } else {

                $http.get((CONTENT_TOC.replace('{LOCATION}'), contentDir))

                    .then(function (result) {

                        var data = result.data;
                    var lang = localizedContent.determineLanguage(data, $stateParams.title);
                    $scope.templateUrl = content_url.replace('{LANG}', lang);

                    // Ensure that images are loaded correctly
                    $templateCache.remove($scope.templateUrl);

                    if ($stateParams.id) $timeout(function () {
                        var element = document.getElementById($stateParams.id);
                        element.scrollIntoView();
                        var clickEvent = new MouseEvent("click", {
                            bubbles: false,
                            cancelable: true,
                            view: window
                        });
                        var link = element.parentElement.parentElement;
                        link.dispatchEvent(clickEvent);
                    }, 500);
                }).catch(function(error) {
                    console.log(error)
                });
            }
        }]);
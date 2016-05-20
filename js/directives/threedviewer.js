'use strict';

angular.module('arachne.directives')

.directive('threeDViewer', ['$window', '$q', function ($window, $q) {
    return {

        restrict: 'A',
        scope: { options: '=' },

        link: function (scope, element, attrs) {
            var load_script = function() {
                var paths = [
                    "node_modules/3dviewer/dist/3dviewer.js"
                ];

                var pathsCount = paths.length
                var loadingIndex = 0;

                var listener = function () {
                    loadingIndex++;
                    if(loadingIndex<pathsCount) {
                        var scriptTag = document.createElement('script');
                        scriptTag.src = paths[loadingIndex];
                        document.body.appendChild(scriptTag);
                        scriptTag.addEventListener('load', listener, false);
                    } else {
                        initialize();
                    }
                }

                var newScriptTag = document.createElement('script');
                newScriptTag.src = paths[loadingIndex];
                document.body.appendChild(newScriptTag);
                newScriptTag.addEventListener('load', listener, false);
            };

            var lazyLoadApi = function(key) {

                var deferred = $q.defer();
                $window.initialize = function () {
                    _3dviewer(scope.options);
                    deferred.resolve();
                };
                if ($window.attachEvent) {
                    $window.attachEvent('onload', load_script);
                } else {
                    if (document.readyState === "complete") {
                        load_script();
                    } else {
                        $window.addEventListener('load', load_script, false);
                    }

                }

                return deferred.promise;
            };

            if ($window.THREE) {
                init();
            } else {
                lazyLoadApi();
            }
        }
    }
}])
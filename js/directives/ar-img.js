'use strict';

angular.module('arachne.directives')

    .directive('arImg', ['arachneSettings', '$http', function (arachneSettings, $http) {

        return {
            scope: {
                imgId: '@',
                imgWidth: '@',
                imgHeight: '@'
            },
            restrict: 'A',
            link: function (scope, element, attrs) {

                scope.loadImg = function () {
                    
                    var img = element[0];
                    if (scope.imgId) {
                        var img = element[0];
                        var imgUri = arachneSettings.dataserviceUri + "/image/";
                        if (scope.imgWidth) {
                            imgUri += "width/" + scope.imgId + "?width=" + scope.imgWidth;
                        } else {
                            imgUri += "height/" + scope.imgId + "?height=" + scope.imgHeight;
                        }
                        $http.get(imgUri, {responseType: 'arraybuffer'})
                            .success(function (data) {
                                var blob = new Blob([data], {type: 'image/jpeg'});
                                img.src = window.URL.createObjectURL(blob);
                            }).error(function (result) {
                                img.src = 'img/imagePlaceholder.png';
                                if (scope.imgWidth) img.width = scope.imgWidth;
                                if (scope.imgHeight) img.height = scope.imgHeight;
                            }
                        );
                    } else {
                        img.src = 'img/imagePlaceholder.png';
                        if (scope.imgWidth) img.width = scope.imgWidth;
                        if (scope.imgHeight) img.height = scope.imgHeight;
                    }
                };

                if (element[0].tagName == 'IMG') {
                    scope.loadImg();
                } else {
                    console.log("Warning: ar-img directive used on a non img element!");
                }

                scope.$watch('imgId', function () {
                    scope.loadImg();
                })

            }
        }
    }]);
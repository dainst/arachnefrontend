'use strict';

angular.module('arachne.directives')

    .directive('arImg', ['arachneSettings', '$http', '$sce', function (arachneSettings, $http, $sce) {

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
                        } else if (scope.imgHeight) {
                            imgUri += "height/" + scope.imgId + "?height=" + scope.imgHeight;
                        } else {
                            imgUri += scope.imgId;
                        }
                        $http.get(imgUri, {responseType: 'arraybuffer'})
                            .then(function (result) {

                                var data = result.data;
                                var blob = new Blob([data], {type: 'image/jpeg'});
                                img.src = window.URL.createObjectURL(blob);
                            }).catch(function (result) {
                                img.src = 'img/placeholder/placeholderError.png';
                                if (scope.imgWidth) img.width = scope.imgWidth;
                                if (scope.imgHeight) img.height = scope.imgHeight;
                            }
                        );
                    } else {
                        img.src = 'img/placeholder/placeholderNoImage.png';
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
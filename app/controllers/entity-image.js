'use strict';

angular.module('arachne.controllers')

    .controller('EntityImageController', ['$stateParams', '$scope', '$uibModal', 'Entity', 'authService', 'searchService', '$location', 'arachneSettings', '$http', '$window', '$rootScope', 'message',
        function ($stateParams, $scope, $uibModal, Entity, authService, searchService, $location, arachneSettings, $http, $window, $rootScope, message) {

            $rootScope.hideFooter = true;
            $scope.allow = true;

            var fullscreen = false;
            var rotation = 0;

            $scope.refreshImageIndex = function () {
                if ($scope.entity && $scope.entity.images) {
                    for (var i = 0; i < $scope.entity.images.length; i++) {
                        if ($scope.entity.images[i].imageId == $scope.imageId) {
                            $scope.imageIndex = i;
                            break;
                        }
                    }
                }
            };

            $scope.requestFullscreen = function () {
                var element = document.getElementById('theimage');
                // Find the right method, call on correct element

                if (fullscreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    fullscreen = false;
                } else {
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen();
                    } else if (element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    }
                    fullscreen = true;
                }
            };

            $scope.downloadImage = function () {
                var imgUri = arachneSettings.dataserviceUri + "/image/" + $scope.imageId;
                var entityUri = arachneSettings.dataserviceUri + "/entity/" + $scope.imageId;

                $http.get(imgUri, {responseType: 'blob'}).success(function (data) {

                    var blob = new Blob([data], {type: 'image/jpeg'});
                    var blobUri = $window.URL.createObjectURL(blob);

                    $http.get(entityUri).success(function (data) {

                        if (navigator.appVersion.toString().indexOf('.NET') > 0)
                            window.navigator.msSaveBlob(blob, data.title);
                        else {
                            var document = $window.document;
                            var a = document.createElement('a');
                            document.body.appendChild(a);
                            a.setAttribute('style', 'display:none');
                            a.href = blobUri;
                            a.download = data.title;
                            a.click();
                        }
                    });

                });
            };

            $scope.user = authService.getUser();
            $scope.currentQuery = searchService.currentQuery();
            $scope.entityId = $stateParams.entityId;
            $scope.imageId = $stateParams.imageId;
            Entity.get({id: $stateParams.entityId}, function (data) {

                $scope.entity = data;
                $scope.refreshImageIndex();
            }, function (response) {
                message.addMessageForCode("entity_" + response.status);
            });
            Entity.imageProperties({id: $scope.imageId}, function (data) {
                $scope.imageProperties = data;
                $scope.allow = true;
            }, function (response) {
                if (response.status == '403') {
                    $scope.allow = false;
                } else {
                    message.addMessageForCode('image_' + response.status);
                }
            });


            $scope.rotateRight = function () {
                var container = document.getElementsByClassName('leaflet-tile-pane')[0];
                var leafletContainer = document.getElementsByClassName('leaflet-container')[0];
                
                rotation += 90;
                if (rotation > 360) rotation = 0;
                

                container.style.width = leafletContainer.offsetWidth + "px";
                container.style.height = leafletContainer.offsetHeight + "px";
                container.style.transform = "rotate("+ rotation + "deg)";
            }

            $scope.$watch("imageId", function () {
                $scope.refreshImageIndex();
            });

        }
    ]);
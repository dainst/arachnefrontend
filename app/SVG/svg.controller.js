/**
 * Created by Simon Hohl <simon.hohl@dainst.org> on 16.10.17.
 */

'use strict';

angular.module('arachne.controllers')

    .controller('SvgController', ['$scope', '$http', '$location', 'arachneSettings',
        function ($scope, $http, $location, arachneSettings) {

            $scope.titleDisplay = document.querySelector('#svg-title');
            $scope.licenseDisplay = document.querySelector('#svg-license');
            $scope.modellerDisplay = document.querySelector('#svg-modeller');
            $scope.statusElement = document.querySelector('#svg-status');
            $scope.requestedId = null;
            $scope.panZoomObject = null;

            $scope.init = function (){
                $scope.requestedId = $location.search().id;

                var metadataRequestURL = arachneSettings.dataserviceUri + '/model/' + $scope.requestedId  + '?meta=true';
                $http.get(metadataRequestURL)
                    .then(function(response) {
                        if(!$scope.validFormat(response.data.format)){
                            var msg = 'Error: "' + response.data.format + '" is no valid vector graphics format for this viewer.';
                            $scope.statusElement.innerHTML = msg;
                            $scope.statusElement.classList.remove('alert-success');
                            $scope.statusElement.classList.add('alert-danger');
                            return;
                        }
                        $scope.displayMetadata(response.data);
                        $scope.loadSVGData(arachneSettings.dataserviceUri + '/model/' + $scope.requestedId);
                    }, function (response){
                       console.dir(response)
                    });
                };

            $scope.displayMetadata = function(metadata) {

                $scope.titleDisplay.innerHTML = metadata['title'];
                $scope.licenseDisplay.innerHTML = metadata['license'];
                $scope.modellerDisplay.innerHTML = metadata['modeller'];
            };

            $scope.validFormat = function(format) {
                switch(format) {
                    case 'svg':
                        return true;
                    default:
                        return false;
                }
            };

            $scope.loadSVGData = function(url) {
                $http.get(url).then(function (response) {
                    var svgContainer = document.querySelector('#svg-data-container');

                    svgContainer.innerHTML = response.data;
                    var metadataElement = document.querySelector('#svg-metadata-container');

                    $scope.statusElement.style.display = 'none';
                    metadataElement.style.display = 'block';

                    var svgContent = svgContainer.querySelector('svg');

                    $scope.panZoomObject = svgPanZoom(svgContent, {
                        controlIconsEnabled: false,
                        maxZoom: 1000,
                        fit: true,
                        contain: true
                    });

                }, function (error) {
                    console.dir(error);
                })
            };

            $scope.zoomInSVG = function () {
                $scope.panZoomObject.zoomIn();
            };

            $scope.zoomOutSVG = function () {
                $scope.panZoomObject.zoomOut();
            };

            $scope.resetSVG = function () {
                $scope.panZoomObject.reset();
            };

            $scope.init();
        }
    ]);
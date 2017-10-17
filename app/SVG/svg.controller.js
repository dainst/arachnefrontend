/**
 * Created by Simon Hohl <simon.hohl@dainst.org> on 16.10.17.
 */

'use strict';

angular.module('arachne.controllers')

    .controller('SvgController', ['$scope', '$rootScope', '$http', '$location', 'arachneSettings',
        function ($scope, $rootScope, $http, $location, arachneSettings) {

            $rootScope.hideFooter = true;
            $scope.titleDisplay = document.querySelector("#svg-title");
            $scope.licenseDisplay = document.querySelector("#svg-license");
            $scope.modellerDisplay = document.querySelector("#svg-modeller");

            $scope.requestedId = null;
            $scope.panZoomObject = null;

            $scope.init = function (){
                $scope.requestedId = $location.search().id;

                var metadataRequestURL = arachneSettings.dataserviceUri + '/model/' + $scope.requestedId  + "?meta=true";
                $http.get(metadataRequestURL)
                    .then(function(response) {
                        if(!$scope.validFormat(response.data.format)){
                            console.dir(response.data.format + "is no valid vector graphics format for this viewer.");
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
                    var svgContainer = document.querySelector('#svg-container');
                    svgContainer.innerHTML = response.data;

                    var svgContent = document.querySelector('svg');

                    $scope.panZoomObject = svgPanZoom(svgContent, {
                        controlIconsEnabled: false,
                        maxZoom: 1000
                    });

                }, function (error) {
                    console.dir(error);
                })
            };

            $scope.init();
        }
    ]);
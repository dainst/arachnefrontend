'use strict';

angular.module('arachne.controllers')

.controller('DownloadController', ['$scope', '$uibModalInstance', '$http', 'arachneSettings', 'downloadUrl',
    function ($scope, $uibModalInstance, $http, arachneSettings, downloadUrl) {

        $scope.mode = 'csv';
        $scope.formats = [];
        $scope.message = "";
        $scope.status = -1;

        function refresh() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }

        $http.get(arachneSettings.dataserviceUri + '/export/types').then(
            function(response) {
                $scope.formats = angular.isDefined(response.data) ? response.data : [];
                $scope.message = "";
                refresh();
            },
            function(response){
                $scope.message = "No export formats available";
                $scope.status = response.status;
                console.warn(response);
                refresh();
            }
        );

        $scope.downloadAs = function() {
            var connector = (downloadUrl.indexOf('?') > -1) ? '&' : '?';
            var url = arachneSettings.dataserviceUri + downloadUrl + connector +'mediaType=' + $scope.mode;
            $http.get(url).then(
                function(response) {
                    $scope.status = response.status;
                    if ($scope.status === 200) {
                        $scope.message = "";
                        var linkElem = document.querySelector('#hiddenDownloadLink');
                        var link = angular.element(linkElem);
                        link.prop("href", 'data: ' + $scope.mode + ';charset=utf-8,' + '\ufeff' + encodeURIComponent(response.data));
                        link.prop("download", 'currentSearch.' + $scope.mode);
                        linkElem.click();
                        $uibModalInstance.dismiss();
                    } else {
                        $scope.message = response.data;
                    }
                    refresh();
                },
                function(response) {
                    console.warn(response);
                    $scope.message = response.data;
                    $scope.status = response.status;
                    refresh();
                }
            );

        };

        $scope.changeMode = function(mode){
            $scope.mode = mode;
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss();
        };

        $scope.isSuccess = function() {
            if ($scope.status === -1) {
                return null;
            }
            return ($scope.status.toString().substr(0, 1) === "2");
        };

        $scope.reset = function() {
            $scope.status = -1;
            $scope.message = "";
        }
}]);

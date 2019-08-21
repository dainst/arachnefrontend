'use strict';

angular.module('arachne.controllers')

.controller('DownloadController', ['$scope', '$uibModalInstance', '$http', '$filter', 'arachneSettings', 'downloadUrl', 'transl8', 'language',
    function ($scope, $uibModalInstance, $http, $filter, arachneSettings, downloadUrl, transl8, language) {

        $scope.mode = 'csv';
        $scope.formats = [];
        $scope.message = "";
        $scope.status = -1;

        function refresh() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }

        function reset() {
            $scope.status = -1;
            $scope.message = "";
        }

        function transl8Response(msg) {
            if (msg.substr(0, 12) !== "data_export_") {
                return msg;
            }
            var msgParts = msg.split("|");
            var msgKey = msgParts.shift();
            var transl8edMsg = $filter('transl8')(msgKey);
            return transl8edMsg + msgParts.join("|");
        }

        function getTypes() {
            $http.get(arachneSettings.dataserviceUri + '/export/types').then(
                function(response) {
                    $scope.formats = angular.isDefined(response.data) ? response.data : [];
                    $scope.message = "";
                    refresh();
                },
                function(response) {
                    $scope.message = $filter('transl8')("data_export_no_export_formats_available");
                    $scope.status = response.status;
                    $scope.mode = "?";
                    console.warn("could not get types:", response);
                    refresh();
                    return response;
                });
        }

        $scope.downloadAs = function() {
            var connector = (downloadUrl.indexOf('?') > -1) ? '&' : '?';
            var url = arachneSettings.dataserviceUri + downloadUrl + connector +'mediatype=' + $scope.mode + '&lang=' + language.currentLanguage();
            $http.get(url).then(
                function(response) {
                    $scope.status = response.status;
                    if ($scope.status === 200) {
                        $scope.message = "";
                        var headers = response.headers();
                        var encoding = angular.isDefined(headers['content-encoding'])
                            ? headers['content-encoding'] + ','
                            : 'charset=utf-8,' + '\ufeff';
                        var linkElem = document.querySelector('#hiddenDownloadLink');
                        var link = angular.element(linkElem);
                        var dlUrl =  'data:' + $scope.formats[$scope.mode] + ';' + encoding + encodeURIComponent(response.data);
                        link.prop("href", dlUrl);
                        link.prop("download", 'export.' + $scope.mode);
                        linkElem.click();
                        $uibModalInstance.dismiss();
                    } else {
                        $scope.message = transl8Response(response.data);
                    }
                    refresh();
                },
                function(response) {
                    console.warn(response);
                    var bodyRegex = /<body[^>]*>(.*)<\/body>/;
                    var getBody = bodyRegex.exec(response.data);
                    if ((getBody !== null) && angular.isDefined(getBody[1])) {
                        $scope.message = getBody[1];
                    } else {
                        $scope.message = transl8Response(response.data);
                    }
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
            if (!$scope.formats.length) {
                getTypes();
            }
            reset();
        }
}]);

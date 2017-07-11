'use strict';

angular.module('arachne.controllers')

    .controller('ThreeDimensionalController', ['$scope', '$location', '$http', '$uibModal', 'arachneSettings', '$rootScope',
        function ($scope, $location, $http, $uibModal, arachneSettings, $rootScope) {

            $rootScope.hideFooter = true;
            $scope.backendUri = arachneSettings.dataserviceUri;

            this.showInfo = function () {

                if (!$scope.metainfos) {
                    var url = arachneSettings.dataserviceUri + "/model/" + $location.search().id + "?meta=true";
                    $http.get(url)
                        .then(function (result) {
                        $scope.metainfos = result.data;
                    });
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/3d/3d-info-modal.html',
                    scope: $scope
                });

                modalInstance.close = function () {
                    modalInstance.dismiss();
                }

            }
        }
    ]);
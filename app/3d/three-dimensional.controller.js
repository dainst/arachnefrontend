'use strict';

angular.module('arachne.controllers')

    .controller('ThreeDimensionalController', ['$scope', '$location', '$http', '$uibModal', 'arachneSettings', '$rootScope',
        function ($scope, $location, $http, $uibModal, arachneSettings, $rootScope) {

            $rootScope.hideFooter = true;
            $scope.backendUri = arachneSettings.dataserviceUri;

            this.showInfo = function () {

                if (!$scope.metainfos) {
                    $http.get(arachneSettings.dataserviceUri + "/model/" + $location.search().id + "?meta=true").success(function (data) {
                        $scope.metainfos = data;
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
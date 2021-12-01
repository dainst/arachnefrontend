export default function ($scope, $location, $http, $uibModal, arachneSettings, $rootScope) {

    $rootScope.tinyFooter = true;
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
            template: require('./3d-info-modal.html'),
            scope: $scope
        });

        modalInstance.close = function () {
            modalInstance.dismiss();
        }

    }
};

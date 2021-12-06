export default function($scope, $uibModalInstance, authService, $timeout) {

    $scope.loginData = {};
    $scope.loginerror = false;

    $scope.login = function () {

        authService.setCredentials($scope.loginData.user, $scope.loginData.password, function (response) {
            $scope.loginerror = false;
            var closeModal = function () {
                $uibModalInstance.close(authService.getUser());
            };
            $timeout(closeModal, 500);
        }, function (response) {
            $scope.loginerror = true;
        });

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };
};

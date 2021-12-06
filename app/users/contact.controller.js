export default function($scope, contactService, transl8, messages) {

    $scope.formChange = false;

    $scope.dataChanged = function () {
        $scope.formChange = true;
    };

    window.onbeforeunload = function () {

        if ($scope.formChange) {
            return transl8.getTranslation('ui_unsaved-changes');
        }
    };

    $scope.$on('$locationChangeStart', function (event, next, current) {

        if ($scope.formChange && next !== current) {

            var answer = confirm(transl8.getTranslation('ui_unsaved-changes'));
            if (!answer) {
                event.preventDefault();
            }
        }
    });

    $scope.success = false;
    $scope.error = "";

    /**
    * Checks checkboxes for iAmNoBot and data protection to be set
    */
    var areCheckboxesChecked = function () {
        return $scope.usrData && $scope.dataProtectionCheck && $scope.usrData.iAmHuman;
    };

    $scope.submit = function () {
        if (areCheckboxesChecked()) {
            contactService.sendContact($scope.usrData,
                function (data) {
                    $scope.error = "";
                    $scope.success = true;
                },
                function (error) {
                    $scope.error = data.message;
                }
            );
        } else {
            if ($scope.usrData && $scope.usrData.iAmHuman) {
                messages.add('ui.register.dataProtection', 'danger', false);
            } else {
                messages.add('ui.register.bot', 'danger', false);
            }
        }


    }
};

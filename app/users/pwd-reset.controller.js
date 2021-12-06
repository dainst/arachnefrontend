/**
 * Handles password reset requests.
 *
 * @author: Daniel M. de Oliveira
 */
export default function($scope, $location, PwdReset, messages) {

    var handleResetError = function (data) {
        if (data.data.message != undefined)
            messages.add(data.data.message, 'danger', false);
        else
            messages.add('ui.passwordreset.unkownuser', 'danger', false)
    };

    var handleResetSuccess = function (data) {
        messages.dontClearOnNextLocationChange();
        messages.add('ui.passwordreset.success', 'success');
        $location.path("/");
    };

    $scope.submit = function () {

        if ($scope.user == undefined) {
            messages.add('ui.passwordreset.fieldMissing.all', 'danger', false);
            return;
        }

        PwdReset.save({},
            $scope.user,
            handleResetSuccess,
            handleResetError
        );
    }
};

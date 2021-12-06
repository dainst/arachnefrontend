/**
 * Set new password.
 *
 * @author: Daniel M. de Oliveira
 */
export default function($scope, $stateParams, $filter, $location, PwdActivation, messages) {

    /**
     * Copy the user so that the shown passwords
     * of user object in $scope do not get modified
     *
     * @param user
     */
    var copyUser = function (user) {

        var newUser = JSON.parse(JSON.stringify(user));

        if (user.password)
            newUser.password = $filter('md5')(user.password);
        if (user.passwordConfirm)
            newUser.passwordConfirm = $filter('md5')(user.passwordConfirm);

        return newUser;
    };

    var handleActivationSuccess = function () {

        messages.dontClearOnNextLocationChange();
        messages.add('ui.passwordactivation.success', 'success');
        $location.path("/");
    };

    var handleActivationError = function (data) {
        console.log(data);
        messages.add('ui.register.passwordsDontMatch', 'danger');
    };

    $scope.submit = function () {
        PwdActivation.save({token: $stateParams.token},
            copyUser($scope.user),
            handleActivationSuccess,
            handleActivationError
        );
    }
};

/**
 * Register Form Controller.
 * @see partials/register.html.
 *
 * $scope
 *   user {object} the user object
 *   submit {function} the submit function
 */
export default function ($scope, $http, $filter, messages, arachneSettings, $location) {


    /**
     * The original user object will be copied so the original does not get modified.
     * The copy get send to the backend and will contain the md5 encrypted pwd. If that would
     * modify the reference which is bound to the scope
     * and the request would be rejected, the md5 passes would enter
     * the form and upon a successful request it would be encrypted again and as a result
     * unusable as it would be different from what the user entered.
     */
    var copyUser = function (user) {

        var newUser = JSON.parse(JSON.stringify(user));

        if (user.password)
            newUser.password = $filter('md5')(user.password);
        if (user.passwordValidation)
            newUser.passwordValidation = $filter('md5')(user.passwordValidation);

        return newUser;
    };

    /**
     * Sends the account registration request to the backend
     * and reports if it was successful. If it was not successful,
     * the callback will get a message with an explanation.
     *
     * @param user the user object.
     * @return callback(isSuccess:boolean,message:string)
     */
    var register = function (user, callback) {

        if (!user) { return callback(false, "ui.register.fieldsMissing"); }

        var newUser = copyUser(user);

        $http.post(arachneSettings.dataserviceUri + "/user/register", newUser, {
            "headers": {"Content-Type": "application/json"}
        }).then(function () {
            return callback(true, null);
        }).catch(function (error) {
            return callback(false, angular.isObject(error.data) ? error.data.message : 'default');
        });
    };

    var handleRegisterResult = function (isSuccess, msg) {

        messages.clear();

        if (isSuccess) {
            messages.dontClearOnNextLocationChange();
            messages.add('register_success', 'success');
            $location.path("/");
        }
        else
            messages.add(msg, 'danger', false);
    };

    /**
    * Checks checkboxes for iAmNoBot and data protection to be set
    */
    var areCheckboxesChecked = function () {
        return $scope.dataProtectionCheck && $scope.user.iAmHuman;
    };

    $scope.submit = function () {
        if (areCheckboxesChecked()) {
            register($scope.user, handleRegisterResult);
        } else {
            if ($scope.user.iAmHuman) {
                messages.add('ui.register.dataProtection', 'danger', false);
            } else {
                messages.add('ui.register.bot', 'danger', false);
            }
        }
    };
};

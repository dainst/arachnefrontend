var Common = function () {

    var testUserName = "e2e_test_user";
    var testUserPassword = "test";

    this.typeIn = function (inputField, text) {
        inputField.clear();
        for (var i in text) {
            inputField.sendKeys(text[i]);
        }
        return inputField;
    };

    this.getTestUserName = function () {
        return testUserName;
    };

    this.getTestUserPassword = function () {
        return testUserPassword;
    };

    this.getTestUserPasswordMD5 = function ($filter) {
        return $filter('md5')(testUserPassword);
    };
};

module.exports = new Common();
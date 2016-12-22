var Common = function () {

    var testUserName = 'e2e_test_user';
    var testUserPassword = 'test';
    var testUserFirstname = 'Max';
    var testUserLastname = 'Mustermann';
    var testUserEmail = 'arachne4-tec-devel@uni-koeln.de';
    var testUserInstitution = 'DAI IT';
    var testUserHomepage = 'http://arachne.dainst.org';
    var testUserZIP = '14195';
    var testUserCity = 'Berlin';
    var testUserStreet = 'Podbielskiallee 69-71';
    var testUserCountry = 'Deutschland';
    var testUserPhone = '1234567890';

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

    this.getTestUserFirstname = function () {
        return testUserFirstname;
    };

    this.getTestUserLastname = function () {
        return testUserLastname;
    };

    this.getTestUserEmail = function () {
        return testUserEmail;
    };

    this.getTestUserInstitution = function () {
        return testUserInstitution;
    };

    this.getTestUserHomepage = function () {
        return testUserHomepage;
    };

    this.getTestUserZIP = function () {
        return testUserZIP;
    };

    this.getTestUserCity = function () {
        return testUserCity;
    };

    this.getTestUserStreet = function () {
        return testUserStreet;
    };

    this.getTestUserCountry = function () {
        return testUserCountry;
    };

    this.getTestUserPhone = function () {
        return testUserPhone;
    }
};

module.exports = new Common();


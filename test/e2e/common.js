var request = require('request');
var hasha = require('hasha');
var config = require('../../config/dev-config.json');
var EC = protractor.ExpectedConditions;


var Common = function () {

    var testUserName = 'e2e_test_user';
    var testUserPassword = 'test';
    var testUserFirstname = 'Max';
    var testUserLastname = 'Mustermann';
    var testUserEmail = 'e2e_test_user@example.com';
    var testUserInstitution = 'DAI IT';
    var testUserHomepage = 'http://arachne.dainst.org';
    var testUserZIP = '14195';
    var testUserCity = 'Berlin';
    var testUserStreet = 'Podbielskiallee 69-71';
    var testUserCountry = 'Deutschland';
    var testUserPhone = '1234567890';

    this.typeIn = function (inputField, text) {
        browser.wait(EC.visibilityOf(inputField), 5000);
        inputField.clear();
        for (var i in text) {
            inputField.sendKeys(text[i]);
        }
        return inputField;
    };

    this.createTestUserInDB = function () {
        var hashedPassword = hasha(new Buffer(testUserPassword), { algorithm: 'md5' });

        request({
            url: config.backendUri + '/user/register',
            method: 'POST',
            json: {
                username:testUserName,
                password:hashedPassword,
                passwordValidation:hashedPassword,
                firstname:testUserFirstname,
                lastname:testUserLastname,
                email:testUserEmail,
                emailValidation:testUserEmail,
                zip:testUserZIP,
                place:testUserCity,
                street:testUserStreet,
                country:testUserCountry,
                iAmHuman:'humanIAm'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }, function (err, response, body) {
            // callback?
        });
    };

    this.deleteTestUserInDB = function() {
        var hashedPassword = hasha(new Buffer(testUserPassword), { algorithm: 'md5' });

        request.del(config.backendUri + '/userinfo/' + testUserName)
            .auth(testUserName, hashedPassword, true);
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


var request = require('request');
var promisedRequest = require('./promisedRequest');
var hasha = require('hasha');
var config = require('../../config/dev-config.json');

var EC = protractor.ExpectedConditions;


var Common = function() {

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
        console.log("TYPEIN IS DEPRICATED");
        browser.wait(EC.visibilityOf(inputField), 5000);

        inputField.clear();
        for (var i in text) {
            inputField.sendKeys(text[i]);
        }
        return inputField;
    };

    this.typeInPromised = function(inputField, text) {
        return browser.wait(EC.visibilityOf(inputField), 5) // they should be there, just to be sure
            .then(function() {
                inputField.clear();
                return inputField.sendKeys(text)
            });
    };

    this.getTestUserName = function() {
        return testUserName;
    };

    this.getTestUserPassword = function() {
        return testUserPassword;
    };

    this.getTestUserFirstname = function() {
        return testUserFirstname;
    };

    this.getTestUserLastname = function() {
        return testUserLastname;
    };

    this.getTestUserEmail = function() {
        return testUserEmail;
    };

    this.getTestUserInstitution = function() {
        return testUserInstitution;
    };

    this.getTestUserHomepage = function() {
        return testUserHomepage;
    };

    this.getTestUserZIP = function() {
        return testUserZIP;
    };

    this.getTestUserCity = function() {
        return testUserCity;
    };

    this.getTestUserStreet = function() {
        return testUserStreet;
    };

    this.getTestUserCountry = function() {
        return testUserCountry;
    };

    this.getTestUserPhone = function() {
        return testUserPhone;
    };

    function createTestUserInDB() {
        var hashedPassword = hasha(new Buffer(testUserPassword), {algorithm: 'md5'});
        return promisedRequest("create test user", "post", {
            url: config.backendUri + '/user/register',
            json: {
                username: testUserName,
                password: hashedPassword,
                passwordValidation: hashedPassword,
                firstname: testUserFirstname,
                lastname: testUserLastname,
                email: testUserEmail,
                emailValidation: testUserEmail,
                zip: testUserZIP,
                place: testUserCity,
                street: testUserStreet,
                country: testUserCountry,
                iAmHuman: 'humanIAm'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })();
    }

    this.createTestUserInDB = createTestUserInDB;

    function getAuthData() {
        var hashedPassword = hasha(new Buffer(testUserPassword), {algorithm: 'md5'});
        return {
            user: testUserName,
            pass: hashedPassword,
            sendImmediately: true
        }
    }

    this.deleteTestUserInDB = function() {
        var hashedPassword = hasha(new Buffer(testUserPassword), { algorithm: 'md5' });

        request.del(config.backendUri + '/userinfo/' + testUserName)
            .auth(testUserName, hashedPassword, true);
    };

    this.createTestCatalog = function() {

        var testcatalog = require("./catalog/testcatalog");

        function dataToSend(catalog) {
            var url = config.backendUri + '/catalog';
            if ((typeof catalog === "object") &&  (typeof catalog.id !== "undefined")) {
               url += '/' + catalog.id;
                testcatalog.id = catalog.id;
            }
            return {
                url: url,
                json: testcatalog,
                headers: {'Content-Type': 'application/json'},
                auth: getAuthData()
            };
        }

        /**
         * the catalog endpoint does not allow to save a public catalog. we have to save it first as hidden and then update it as public.
         * otherwise the e2e_test_user could bot see, or we had to login
         */

        return createTestUserInDB()
            .then(promisedRequest("insert Test Catalog", "post", dataToSend))
            .then(promisedRequest("update catalog to make it public", "put", dataToSend))
            .then(function(catalog){return catalog.id})

    };

    this.deleteTestCatalog = function(testCatalogId) {
        return promisedRequest("delete test catalog", 'delete', {
            url: config.backendUri + '/catalog/' + testCatalogId,
            headers: {'Content-Type': 'application/json'},
            auth: getAuthData()
        })()
            .then(this.deleteTestUserInDB)

    }


};

module.exports = new Common();


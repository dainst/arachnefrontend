var frontPage = require('./core/front.page');
var navbarPage = require('./core/navbar.page');
var messageBox = require('./core/message-box.page');

var config = require('../config/dev-config.json')

var request = require('request');
var hasha = require('hasha');

var common = require('./common');

describe('user management page', function () {

    var spec = this;

    this.registerValidUser = function () {
        return navbarPage.clickRegistration()
            .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
            .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
            .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
            .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
            .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
            .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
            .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
            .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
            .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
            .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
            .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
            .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
            .then(navbarPage.registrationSelectCountryByIndex(4))
            .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
            .then(navbarPage.registrationConfirmNoBot)
            .then(navbarPage.submitRegistration)
    };

    this.deleteTestUser = function () {
        var userName = common.getTestUserName();
        var hashedPassword = hasha(new Buffer(common.getTestUserPassword()), { algorithm: 'md5' });

        request.del(config.backendUri + '/userinfo/' + userName)
            .auth(userName, hashedPassword, true);
    };

    beforeAll(function () {
        spec.deleteTestUser();
    });

    beforeEach(function(){
        frontPage.load();
    });

    afterEach(function () {
        spec.deleteTestUser();
    });

    it('user should be able to register', function () {
        spec.registerValidUser()
            .then(function () {
                expect(messageBox.getLevel()).toEqual('success');
                expect(messageBox.getText()).toContain('Registration successful.');
            })
    });

    it('registering with an existing username should cause "danger"-level message', function () {
        spec.registerValidUser()
            .then(spec.registerValidUser)
            .then(function () {
                expect(messageBox.getLevel()).toEqual('danger');
                expect(messageBox.getText()).toContain('The username you have chosen is already in use.');
            })
    });

    it('should be able to login and logout', function () {
        spec.registerValidUser()
            .then(function() {
                return navbarPage.clickLogin();
            })
            .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
            .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
            .then(navbarPage.submitLogin)
            .then(function () {
                return navbarPage.getLoggedInUserName();
            })
            .then(function (name) {
                expect(name).toEqual(common.getTestUserName());
            })
            .then(function() {
                return navbarPage.clickLoggedInUser();
            })
            .then(function() {
                return navbarPage.clickLogout();
            })
            .then(function () {
                expect(navbarPage.isUserLoggedIn()).toBe(false);
            })
    });
});
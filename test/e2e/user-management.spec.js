var EC = protractor.ExpectedConditions;

var frontPage = require('./core/front.page');
var navbarPage = require('./core/navbar.page');
var messageBox = require('./core/message-box.page');

var request = require('request');
var hasha = require('hasha');

var common = require('./common');

describe('user management page', function () {

    beforeAll(function () {
        common.deleteTestUserInDB();
    });

    beforeEach(function(){
        frontPage.load();
    });

    afterEach(function () {
        common.deleteTestUserInDB();
    });

    it('user should be able to register', function () {
        common.deleteTestUserInDB();
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('success');
        })
    });

    /* ---- Tests for omitting a required field in registration ---- */
    it('registering while omitting the username field cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInUsername("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the password field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInPassword("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the password validation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInPasswordValidation("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the firstname field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInFirstname("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the lastname field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInLastname("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the email field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInEmail("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the email validation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInEmailValidation("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the zip code field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInZIP("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the city field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInPlace("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the street field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInStreet("");
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('registering while omitting the country field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials(true);
        //navbarPage.registrationSelectCountryByIndex(0);
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function (level) {
            expect(level).toEqual('danger');
        });
    });

    it('registering while omitting the no-robot confirmation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationConfirmNoBot(); // click again to uncheck
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })

    });
    /* ---- End omission tests ---- */

    it('registering with an existing username should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.submitRegistration();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('should be able to login and logout', function () {

        common.createTestUserInDB();
        //login
        navbarPage.clickLogin();
        navbarPage.loginTypeInUsername(common.getTestUserName());
        navbarPage.loginTypeInPassword(common.getTestUserPassword());
        navbarPage.submitLogin();
        expect(navbarPage.getLoggedInUserName()).toEqual(common.getTestUserName());
        //logout
        navbarPage.clickLoggedInUser();
        navbarPage.clickLogout();
        expect(navbarPage.isUserLoggedIn()).toBe(false);
    });

    it('invalid username on login should cause "warning"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.loginTypeInUsername('e2e_test_imposter');
        navbarPage.loginTypeInPassword(common.getTestUserPassword());
		navbarPage.submitLogin();
		browser.wait(EC.presenceOf(navbarPage.getLoginWarning()));
    });

    it('invalid user password on login should cause "warning"-level message', function () {
        common.createTestUserInDB();
        frontPage.load();
        navbarPage.clickLogin();
        navbarPage.loginTypeInUsername(common.getTestUserName());
        navbarPage.loginTypeInPassword('tset');
        navbarPage.submitLogin();
        browser.wait(EC.presenceOf(navbarPage.getLoginWarning()));
    });

    it('should be able to close login modal', function () {
        navbarPage.clickLogin();
        navbarPage.closeLoginModal();
        browser.wait(EC.stalenessOf(navbarPage.getLoginModal()));
    });
    
    it('should be able to request password reset', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.submitPasswordReset();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('success');
        })
    });

    it('empty user data when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.clickPasswordReset();
        navbarPage.submitPasswordReset();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    /* ---- Tests for invalid user data for reset ---- */
    it('invalid username when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetTypeInUsername('e2e_test_imposter');
        navbarPage.submitPasswordReset();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('invalid email when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetTypeInEmail('email@scam.com');
        navbarPage.submitPasswordReset();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('invalid firstname when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetTypeInFirstname('Moritz');
        navbarPage.submitPasswordReset();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('invalid lastname when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetTypeInLastname('What?');
        navbarPage.submitPasswordReset();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });

    it('invalid no-robot confirmation when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetConfirmNoBot(); // click again to uncheck
        navbarPage.submitPasswordReset();
        messageBox.getLevel().then(function(level) {
            expect(level).toEqual('danger');
        })
    });
    /* ---- End invalid reset data tests ---- */
});
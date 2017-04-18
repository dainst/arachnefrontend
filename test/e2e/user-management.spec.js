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
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('success');
    });

    /* ---- Tests for omitting a required field in registration ---- */
    it('registering while omitting the username field cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInUsername("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the password field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInPassword("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the password validation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInPasswordValidation("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the firstname field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInFirstname("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the lastname field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInLastname("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the email field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInEmail("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the email validation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInEmailValidation("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the zip code field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInZIP("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the city field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInPlace("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the street field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInStreet("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    xit('registering while omitting the country field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationSelectCountryByIndex(0); // not working!
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('registering while omitting the no-robot confirmation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationConfirmNoBot(); // click again to uncheck
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });
    /* ---- End omission tests ---- */

    it('registering with an existing username should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    xit('should be able to login and logout', function () { // Failed: No element found using locator: By(css selector, a[href*="bookmarks"])

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
        expect(messageBox.getLevel()).toEqual('success');
    });

    it('empty user data when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.clickPasswordReset();
        navbarPage.submitPasswordReset();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    /* ---- Tests for invalid user data for reset ---- */
    it('invalid username when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetTypeInUsername('e2e_test_imposter');
        navbarPage.submitPasswordReset();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('invalid email when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetTypeInEmail('email@scam.com');
        navbarPage.submitPasswordReset();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('invalid firstname when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetTypeInFirstname('Moritz');
        navbarPage.submitPasswordReset();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('invalid lastname when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetTypeInLastname('What?');
        navbarPage.submitPasswordReset();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    it('invalid no-robot confirmation when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();
        navbarPage.clickLogin();
        navbarPage.typeInCompleteResetCredentials();
        navbarPage.passwordResetConfirmNoBot(); // click again to uncheck
        navbarPage.submitPasswordReset();
        expect(messageBox.getLevel()).toEqual('danger');
    });
    /* ---- End invalid reset data tests ---- */
});
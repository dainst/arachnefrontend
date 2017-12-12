var EC = protractor.ExpectedConditions;

var frontPage = require('./core/front.page');
var navbarPage = require('./core/navbar.page');
var messageBox = require('./core/message-box.page');


var common = require('./common');

describe('user management page', function () {

    beforeAll(common.deleteTestUserInDB);

    beforeEach(frontPage.load);

    afterEach(common.deleteTestUserInDB);

    it('user should be able to register', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('success')); // I put expect here, because sometimes an other message box may appear earlier
    });

    /* ---- Tests for omitting a required field in registration ---- */
    it('registering while omitting the username field cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInUsername(""))
            .then(navbarPage.submitRegistration)
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    it('registering while omitting the password field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInPassword(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))
    });

    it('registering while omitting the password validation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInPasswordValidation(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    it('registering while omitting the firstname field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInFirstname(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    it('registering while omitting the lastname field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInLastname(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))
    });

    it('registering while omitting the email field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInEmail(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))
    });

    it('registering while omitting the email validation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInEmailValidation(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))
    });

    it('registering while omitting the zip code field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInZIP(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))
    });

    it('registering while omitting the city field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInPlace(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))
    });

    it('registering while omitting the street field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInStreet(""))
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))
    });

    it('registering while omitting the country field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials(true)
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))

    });

    it('registering while omitting the no-robot confirmation field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationConfirmNoBot())
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'))

    });
    /* ---- End omission tests ---- */

    it('registering with an existing username should cause "danger"-level message', function() {
        common.createTestUserInDB()
            .then(navbarPage.typeInCompleteRegistrationCredentials())
            .then(navbarPage.submitRegistration())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    it('should be able to login and logout', function() {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
            .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
            .then(navbarPage.submitLogin())
            .then(expect(navbarPage.getLoggedInUserName()).toEqual(common.getTestUserName()))
            .then(navbarPage.clickLoggedInUser())
            .then(navbarPage.clickLogout())
            .then(expect(navbarPage.isUserLoggedIn()).toBe(true))
    });

    /*
        stand: der folgende test läuft auch dann durch, wenn man nicht den falschen username hat :D
     */


    it('invalid username on login should cause "warning"-level message', function() {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.loginTypeInUsername('e2e_test_imposter'))
            .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
            .then(navbarPage.submitLogin())
            .then(expect(navbarPage.getLoginWarning().isPresent()).toBe(true))
    });

    it('invalid user password on login should cause "warning"-level message', function() {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
            .then(navbarPage.loginTypeInPassword('tset'))
            .then(navbarPage.submitLogin())
            .then(expect(navbarPage.getLoginWarning().isPresent()).toBe(true))
    });

    it('should be able to close login modal', function () {
        navbarPage.clickLogin()
            .then(navbarPage.closeLoginModal())
            .then(expect(navbarPage.getLoginModal().isPresent()).toBe(false))
    });
    
    it('should be able to request password reset', function () {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.clickPasswordReset())
            .then(navbarPage.typeInCompleteResetCredentials())
            .then(navbarPage.submitPasswordReset())
            .then(expect(messageBox.getLevel()).toEqual('success'));

    });


    it('empty user data when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.clickPasswordReset())
            .then(navbarPage.submitPasswordReset())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    /* ---- Tests for invalid user data for reset ---- */
    it('invalid username when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.clickPasswordReset())
            .then(navbarPage.typeInCompleteResetCredentials())
            .then(navbarPage.passwordResetTypeInUsername('e2e_test_imposter'))
            .then(navbarPage.submitPasswordReset())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    it('invalid email when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.clickPasswordReset())
            .then(navbarPage.typeInCompleteResetCredentials())
            .then(navbarPage.passwordResetTypeInEmail('email@scam.com'))
            .then(navbarPage.submitPasswordReset())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    it('invalid firstname when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.clickPasswordReset())
            .then(navbarPage.typeInCompleteResetCredentials())
            .then(navbarPage.passwordResetTypeInFirstname('Moritz'))
            .then(navbarPage.submitPasswordReset())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    it('invalid lastname when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.clickPasswordReset())
            .then(navbarPage.typeInCompleteResetCredentials())
            .then(navbarPage.passwordResetTypeInLastname('What?'))
            .then(navbarPage.submitPasswordReset())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });

    it('invalid no-robot confirmation when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB()
            .then(navbarPage.clickLogin())
            .then(navbarPage.clickPasswordReset())
            .then(navbarPage.typeInCompleteResetCredentials())
            .then(navbarPage.passwordResetConfirmNoBot())
            .then(navbarPage.submitPasswordReset())
            .then(expect(messageBox.getLevel()).toEqual('danger'));
    });
    /* ---- End invalid reset data tests ---- */
});
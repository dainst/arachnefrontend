var EC = protractor.ExpectedConditions;

var frontPage = require('./core/front.page');
var navbarPage = require('./core/navbar.page');
var messageBox = require('./core/message-box.page');

var config = require('../../config/dev-config.json');

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

    // it('registering while omitting a required field should cause "danger"-level message', function () {
    //     navbarPage.clickRegistration()
    //         // Missing username
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing password
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing passwordValidation
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing firstname
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing lastname
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing email
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing email validation
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing ZIP
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing city
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing street
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing selected country
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.registrationConfirmNoBot)
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    //         // Missing no-robot confirmation
    //         .then(navbarPage.registrationTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.registrationTypeInPassword(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInPasswordValidation(common.getTestUserPassword()))
    //         .then(navbarPage.registrationTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.registrationTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.registrationTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInEmailValidation(common.getTestUserEmail()))
    //         .then(navbarPage.registrationTypeInInstitution(common.getTestUserInstitution()))
    //         .then(navbarPage.registrationTypeInHomepage(common.getTestUserHomepage()))
    //         .then(navbarPage.registrationTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.registrationTypeInPlace(common.getTestUserCity()))
    //         .then(navbarPage.registrationTypeInStreet(common.getTestUserStreet()))
    //         .then(navbarPage.registrationSelectCountryByIndex(4))
    //         .then(navbarPage.registrationTypeInPhone(common.getTestUserPhone()))
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function() {
    //             return navbarPage.clickRegistration();
    //         })
    // });

    it('user should be able to register', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.submitRegistration)
            .then(function () {
                expect(messageBox.getLevel()).toEqual('success');
            })
    });

    // it('registering with an existing username should cause "danger"-level message', function () {
    //
    //     common.createTestUserInDB();
    //
    //     navbarPage.typeInCompleteRegistrationCredentials()
    //         .then(navbarPage.submitRegistration)
    //         .then(function () {
    //             expect(messageBox.getLevel()).toEqual('danger');
    //         });
    // });

    it('should be able to login and logout', function () {
        common.createTestUserInDB();

        navbarPage.clickLogin()
            .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
            .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
            .then(function() {
                return navbarPage.submitLogin()
			})
            .then(function () {
                return navbarPage.getLoggedInUserName();
            })
            .then(function (name) {
                return expect(name).toEqual(common.getTestUserName());
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

    it('invalid user data on login should cause "danger"-level message', function () {
        common.createTestUserInDB();

        navbarPage.clickLogin()
            .then(navbarPage.loginTypeInUsername('e2e_test_imposter'))
            .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
			.then(function() {
				return navbarPage.submitLogin()
			})
            .then(function () {
                return browser.wait(EC.presenceOf(navbarPage.getLoginWarning()));
            })
            .then(frontPage.load)
            .then(function () {
                return navbarPage.clickLogin();
            })
            .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
            .then(navbarPage.loginTypeInPassword('tset'))
			.then(function() {
				return navbarPage.submitLogin()
			})
            .then(function () {
                browser.wait(EC.presenceOf(navbarPage.getLoginWarning()));
            })
    });

    it('should be able to close login modal', function () {
        navbarPage.clickLogin()
            .then(navbarPage.closeLoginModal)
            .then(function() {
                browser.wait(EC.stalenessOf(navbarPage.getLoginModal()))
            })
    });
    
    it('should be able to request password reset', function () {
        common.createTestUserInDB();

        navbarPage.clickLogin()
            .then(navbarPage.clickPasswordReset)
            .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
            .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
            .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
            .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
            .then(navbarPage.passwordResetTypeInZIP(common.getTestUserZIP()))
            .then(navbarPage.passwordResetConfirmNoBot)
            .then(navbarPage.submitPasswordReset)
            .then(function () {
                expect(messageBox.getLevel()).toEqual('success');
            })
    });

    it('empty user data when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();

        navbarPage.clickLogin()
            .then(navbarPage.clickPasswordReset)
            .then(navbarPage.submitPasswordReset)
            .then(function () {
                expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    // it('invalid user data when requesting password reset should cause "danger"-level message', function () {
    //     common.createTestUserInDB();
    //
    //     navbarPage.clickLogin()
    //         .then(navbarPage.clickPasswordReset)
    //         .then(navbarPage.passwordResetTypeInUsername('e2e_test_imposter'))
    //         .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.passwordResetTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.passwordResetConfirmNoBot)
    //         .then(navbarPage.submitPasswordReset)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function () {
    //             return navbarPage.clickLogin()
    //         })
    //         .then(navbarPage.clickPasswordReset)
    //         .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.passwordResetTypeInEmail('email@scam.com'))
    //         .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.passwordResetTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.passwordResetConfirmNoBot)
    //         .then(navbarPage.submitPasswordReset)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function () {
    //             return navbarPage.clickLogin()
    //         })
    //         .then(navbarPage.clickPasswordReset)
    //         .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.passwordResetTypeInFirstname('Moritz'))
    //         .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.passwordResetTypeInZIP(common.getTestUserZIP()))
    //         .then(navbarPage.passwordResetConfirmNoBot)
    //         .then(navbarPage.submitPasswordReset)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         // .then(frontPage.load)
    //         // .then(function () {
    //         //     return navbarPage.clickLogin()
    //         // })
    //         // .then(navbarPage.clickPasswordReset)
    //         // .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
    //         // .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
    //         // .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
    //         // .then(navbarPage.passwordResetTypeInLastname('What?'))
    //         // .then(navbarPage.passwordResetTypeInZIP(common.getTestUserZIP()))
    //         // .then(navbarPage.passwordResetConfirmNoBot)
    //         // .then(navbarPage.submitPasswordReset)
    //         // .then(function () {
    //         //     expect(messageBox.getLevel()).toEqual('danger');
    //         // })
    //         .then(frontPage.load)
    //         .then(function () {
    //             return navbarPage.clickLogin()
    //         })
    //         .then(navbarPage.clickPasswordReset)
    //         .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.passwordResetTypeInZIP('0987654321'))
    //         .then(navbarPage.passwordResetConfirmNoBot)
    //         .then(navbarPage.submitPasswordReset)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    //         .then(frontPage.load)
    //         .then(function () {
    //             return navbarPage.clickLogin()
    //         })
    //         .then(navbarPage.clickPasswordReset)
    //         .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
    //         .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
    //         .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
    //         .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
    //         .then(navbarPage.passwordResetTypeInZIP('0987654321'))
    //         .then(navbarPage.submitPasswordReset)
    //         .then(function () {
    //             return expect(messageBox.getLevel()).toEqual('danger');
    //         })
    // });
});
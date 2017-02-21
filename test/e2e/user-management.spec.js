var EC = protractor.ExpectedConditions;

var frontPage = require('./core/front.page');
var navbarPage = require('./core/navbar.page');
var messageBox = require('./core/message-box.page');

var request = require('request');
var hasha = require('hasha');

var common = require('./common');

function reloadRegistration() {
    return frontPage.load()
        .then(function () {
            return navbarPage.typeInCompleteRegistrationCredentials();
        })
}

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

    xit('registering while omitting a required field should cause "danger"-level message', function () {
         navbarPage.typeInCompleteRegistrationCredentials()
             //Missing username
             .then(navbarPage.registrationTypeInUsername(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing password
             .then(navbarPage.registrationTypeInPassword(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing passwordValidation
             .then(navbarPage.registrationTypeInPasswordValidation(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing firstname
             .then(navbarPage.registrationTypeInFirstname(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing lastname
             .then(navbarPage.registrationTypeInLastname(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing email
             .then(navbarPage.registrationTypeInEmail(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing email validation
             .then(navbarPage.registrationTypeInEmailValidation(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing ZIP
             .then(navbarPage.registrationTypeInZIP(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing city
             .then(navbarPage.registrationTypeInPlace(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing street
             .then(navbarPage.registrationTypeInStreet(""))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing selected country
             .then(navbarPage.registrationSelectCountryByIndex(0))
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             })
             .then(reloadRegistration)
             // Missing no-robot confirmation
             .then(navbarPage.registrationConfirmNoBot) // click again to uncheck
             .then(function () {
                 return expect(messageBox.getLevel()).toEqual('danger');
             });
    });

    it('user should be able to register', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.submitRegistration)
            .then(function () {
                expect(messageBox.getLevel()).toEqual('success');
            })
    });

    xit('registering with an existing username should cause "danger"-level message', function () {

        common.createTestUserInDB();

        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.submitRegistration)
            .then(function () {
                expect(messageBox.getLevel()).toEqual('danger');
            });
    });

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

    xit('invalid user data when requesting password reset should cause "danger"-level message', function () {
        common.createTestUserInDB();

        navbarPage.clickLogin()
            // invalid username
            .then(navbarPage.clickPasswordReset)
            .then(navbarPage.passwordResetTypeInUsername('e2e_test_imposter'))
            .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
            .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
            .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
            .then(navbarPage.passwordResetConfirmNoBot)
            .then(navbarPage.submitPasswordReset)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
            .then(frontPage.load)
            .then(function () {
                return navbarPage.clickLogin()
            })
            //invalid email
            .then(navbarPage.clickPasswordReset)
            .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
            .then(navbarPage.passwordResetTypeInEmail('email@scam.com'))
            .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
            .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
            .then(navbarPage.passwordResetConfirmNoBot)
            .then(navbarPage.submitPasswordReset)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
            .then(frontPage.load)
            .then(function () {
                return navbarPage.clickLogin()
            })
            // invalid firstname
            .then(navbarPage.clickPasswordReset)
            .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
            .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
            .then(navbarPage.passwordResetTypeInFirstname('Moritz'))
            .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
            .then(navbarPage.passwordResetConfirmNoBot)
            .then(navbarPage.submitPasswordReset)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
            .then(frontPage.load)
            .then(function () {
                return navbarPage.clickLogin()
            })
            // invalid lastname
            .then(navbarPage.clickPasswordReset)
            .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
            .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
            .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
            .then(navbarPage.passwordResetTypeInLastname('What?'))
            .then(navbarPage.passwordResetConfirmNoBot)
            .then(navbarPage.submitPasswordReset)
            .then(function () {
                expect(messageBox.getLevel()).toEqual('danger');
            })
            .then(frontPage.load)
            .then(function () {
                return navbarPage.clickLogin()
            })
            // missing no-robot confirmation
            .then(navbarPage.clickPasswordReset)
            .then(navbarPage.passwordResetTypeInUsername(common.getTestUserName()))
            .then(navbarPage.passwordResetTypeInEmail(common.getTestUserEmail()))
            .then(navbarPage.passwordResetTypeInFirstname(common.getTestUserFirstname()))
            .then(navbarPage.passwordResetTypeInLastname(common.getTestUserLastname()))
            .then(navbarPage.submitPasswordReset)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });
});
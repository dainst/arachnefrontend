var EC = protractor.ExpectedConditions;

var frontPage = require('./core/front.page');
var navbarPage = require('./core/navbar.page');
var messageBox = require('./core/message-box.page');

var request = require('request');
var hasha = require('hasha');
var EC = protractor.ExpectedConditions;

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

    xit('registering while omitting the username field cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInUsername(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the password field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInPassword(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the password validation field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInPasswordValidation(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the firstname field should cause "danger"-level message', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.registrationTypeInFirstname("");
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('danger');
    });

    xit('registering while omitting the lastname field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInLastname(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the email field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInEmail(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the email validation field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInEmailValidation(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the zip code field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInZIP(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the city field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInPlace(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the street field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationTypeInStreet(""))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the country field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationSelectCountryByIndex(0))
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            })
    });

    xit('registering while omitting the no-robot confirmation field should cause "danger"-level message', function () {
        return navbarPage.typeInCompleteRegistrationCredentials()
            .then(navbarPage.registrationConfirmNoBot) // click again to uncheck
            .then(navbarPage.submitRegistration)
            .then(function () {
                return expect(messageBox.getLevel()).toEqual('danger');
            });
    });

    // xit('registering while omitting a required field should cause "danger"-level message', function () {
    //     // all-in-one
    // });

    it('user should be able to register', function () {
        navbarPage.typeInCompleteRegistrationCredentials();
        navbarPage.submitRegistration();
        expect(messageBox.getLevel()).toEqual('success');
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
var common = require('../common');
var EC = protractor.ExpectedConditions;

var NavbarPage = function() {

    var userDropdown = element(by.css('a[href*="bookmarks"]'));
    var loginButton = element(by.css('#loginbutton'));
    var loginModal = element(by.css('.modal-dialog'));
    var loginInputUsername = element(by.id('input-username'));
	var loginInputPassword = element(by.id('exampleInputPassword2'));
    var submitLoginButton = element(by.id('submit-login'));
    var closeLoginButton = element(by.css('.modal-header > [ng-click="cancel()"]'));
    var forgotPasswordLink = element(by.css('a[href*="pwdreset"]'));
    var loginWarning = element(by.css('p.alert.alert-warning'));
    var logoutButton = element(by.css('[ng-click="logoutFunction();"]'));
    var collapsingNavbar = element(by.css('.navbar-collapse'));
    var registrationButton = element(by.css('a[href*="register"]'));
    var registrationInputUsername = element(by.model('user.username'));
    var registrationInputPassword = element(by.model('user.password'));
    var registrationInputPasswordValidation = element(by.model('user.passwordValidation'));
    var registrationInputFirstname = element(by.model('user.firstname'));
    var registrationInputLastname = element(by.model('user.lastname'));
    var registrationInputEmail = element(by.model('user.email'));
    var registrationInputEmailValidation = element(by.model('user.emailValidation'));
    var registrationInputInstitution = element(by.model('user.institution'));
    var registrationHomepage = element(by.model('user.homepage'));
    var registrationInputZIP = element(by.model('user.zip'));
    var registrationInputPlace = element(by.model('user.place'));
    var registrationInputStreet = element(by.model('user.street'));
    var registrationCountryDropdown = element(by.tagName('idai-country-picker'));
    var registrationPhone = element(by.model('user.phone'));
    var registrationBotConfirm = element(by.model('user.iAmHuman'));
    var registrationDataProtectionPolicyConfirm = element(by.model('dataProtectionCheck'));
    var submitButton = element(by.css('[ng-click="submit()"]'));
    var cancelRegistrationButton = element(by.css('[type="reset"]'));
    var editUserButton = element(by.css('#usermenu a[href="editUser"]'));

    this.expandNavbar = function() {
        return new Promise(function expandNavbarPromise(resolve, reject) {
            browser.wait(EC.visibilityOf(collapsingNavbar), 10)
                .then(element(by.css('.navbar-toggle')).click)
                .catch(function() {/*Navbar expanded. Doing nothing*/})
                .then(resolve)
        });
    };

	this.clickLogin = function() {
        return this.expandNavbar()
            .then(loginButton.click())
            .then(browser.wait(EC.visibilityOf(loginModal)))
	}.bind(this);

    this.clickEditUser = function() {
        return editUserButton.click()
    };

	this.clickRegistration = function() {
        return this.expandNavbar()
            .then(registrationButton.click)
            .then(browser.wait(EC.visibilityOf(registrationInputUsername)))
	};

	this.clickLoggedInUser = function() {
        return this.expandNavbar()
            .then(userDropdown.click)
    };

	this.clickLogout = function() {
        return this.expandNavbar()
            .then(logoutButton.click)
    };

	this.isUserLoggedIn = function() {
	    return new Promise(function(resolve, reject) {
            loginButton.isPresent()
                .then(function (result) {
                    resolve(!result);
                })
                .catch(reject)
        })
    };

    this.isNoUserLoggedIn = function() {
        return loginButton.isPresent();
    };

    this.getLoggedInUserName = function() {
        return this.expandNavbar()
			.then(userDropdown.getText)
			.then(function getLoggedInUserName(text) {
				return text.trim();
            })
    };

    this.getUserDropdown = function() {
        return userDropdown;
    };

    this.getLoginModal = function() {
        return loginModal;
    };

    this.getLoginWarning = function() {
        return loginWarning;
    };

    this.closeLoginModal = function() {
        return closeLoginButton.click();
    };

	this.loginTypeInUsername = function(username) {
		return common.typeInPromised(loginInputUsername, username);
	};

	this.loginTypeInPassword = function(password) {
		return common.typeInPromised(loginInputPassword, password);
	};

    this.submitLogin = function() {
        return submitLoginButton.click();
    };

    this.clickPasswordReset = function() {
        return forgotPasswordLink.click();
    };

    this.passwordResetTypeInUsername = function(text) {
        return common.typeInPromised(registrationInputUsername, text); // Same Angular model binding as registration.
    };

    this.passwordResetTypeInEmail = function(text) {
        return common.typeInPromised(registrationInputEmail, text); // Same Angular model binding as registration.
    };

    this.passwordResetTypeInFirstname = function(text) {
        return common.typeInPromised(registrationInputFirstname, text); // Same Angular model binding as registration.
    };

    this.passwordResetTypeInLastname = function(text) {
        return common.typeInPromised(registrationInputLastname, text); // Same Angular model binding as registration.
    };

    this.passwordResetConfirmNoBot = function() {
        return registrationBotConfirm.click(); // Same Angular model binding as registration.
    };

    this.submitPasswordReset = function() {
        return submitButton.click(); // Same Angular click binding as registration.
    };

    this.registrationTypeInUsername = function(text) {
        return common.typeInPromised(registrationInputUsername, text);
    };

    this.registrationTypeInPassword = function(text) {
        return common.typeInPromised(registrationInputPassword, text);
    };

    this.registrationTypeInPasswordValidation = function(text) {
        return common.typeInPromised(registrationInputPasswordValidation, text);
    };

    this.registrationTypeInFirstname = function(text) {
        return common.typeInPromised(registrationInputFirstname, text);
    };

    this.registrationTypeInLastname = function(text) {
        return common.typeInPromised(registrationInputLastname, text);
    };

    this.registrationTypeInEmail = function(text) {
        return common.typeInPromised(registrationInputEmail, text);
    };

    this.registrationTypeInEmailValidation = function(text) {
        return common.typeInPromised(registrationInputEmailValidation, text);
    };

    this.registrationTypeInInstitution = function(text) {
        return common.typeInPromised(registrationInputInstitution, text);
    };

    this.registrationTypeInHomepage = function(text) {
        return common.typeInPromised(registrationHomepage, text);
    };

    this.registrationTypeInZIP = function(text) {
        return common.typeInPromised(registrationInputZIP, text);
    };

    this.registrationTypeInPlace = function(text) {
        return common.typeInPromised(registrationInputPlace, text);
    };

    this.registrationTypeInStreet = function(text) {
        return common.typeInPromised(registrationInputStreet, text);
    };

    this.registrationSelectCountryByIndex = function(index) {
        if (index !== null) {
            var countryOptions = registrationCountryDropdown.all(by.tagName('option'));
            return countryOptions.get(index).click();
        }
    };

    this.registrationTypeInPhone = function(text) {
        return common.typeInPromised(registrationPhone, text);
    };

    this.registrationConfirmNoBot = function() {
        return registrationBotConfirm.click()
    };

    this.registrationConfirmDataProtectionPolicy = function() {
        return registrationDataProtectionPolicyConfirm.click()
    };

    this.submit = function() {
        return submitButton.click();
    };

    this.clickCancelRegistration = function() {
        return cancelRegistrationButton.click()
    };




    this.typeInCompleteRegistrationCredentials = function(skipCountry) {
        return this.clickRegistration()
            .then(this.registrationTypeInUsername(common.getTestUserName()))
            .then(this.registrationTypeInPassword(common.getTestUserPassword()))
            .then(this.registrationTypeInPasswordValidation(common.getTestUserPassword()))
            .then(this.registrationTypeInFirstname(common.getTestUserFirstname()))
            .then(this.registrationTypeInLastname(common.getTestUserLastname()))
            .then(this.registrationTypeInEmail(common.getTestUserEmail()))
            .then(this.registrationTypeInEmailValidation(common.getTestUserEmail()))
            .then(this.registrationTypeInInstitution(common.getTestUserInstitution()))
            .then(this.registrationTypeInHomepage(common.getTestUserHomepage()))
            .then(this.registrationTypeInZIP(common.getTestUserZIP()))
            .then(this.registrationTypeInPlace(common.getTestUserCity()))
            .then(this.registrationTypeInStreet(common.getTestUserStreet()))
            .then(this.registrationSelectCountryByIndex(skipCountry ? null : 5))
            .then(this.registrationTypeInPhone(common.getTestUserPhone()))
            .then(this.registrationConfirmNoBot())
            .then(this.registrationConfirmDataProtectionPolicy())
    };

    this.typeInCompleteResetCredentials = function() {
        return this.passwordResetTypeInUsername(common.getTestUserName())
            .then(this.passwordResetTypeInEmail(common.getTestUserEmail()))
            .then(this.passwordResetTypeInFirstname(common.getTestUserFirstname()))
            .then(this.passwordResetTypeInLastname(common.getTestUserLastname()))
            .then(this.passwordResetConfirmNoBot())
    }
};

module.exports = new NavbarPage();

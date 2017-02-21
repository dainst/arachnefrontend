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
    var registrationDropdownCountryOptions = element.all(by.repeater('country in countries'));
    var registrationPhone = element(by.model('user.phone'));
    var registrationBotConfirm = element(by.model('user.iAmHuman'));
    var submitRegistrationButton = element(by.css('[ng-click="submit()"]'));
    var cancelRegistrationButton = element(by.css('[type="reset"]'));

	this.clickLogin = function () {
        return this.expandNavbar()
            .then(loginButton.click())
	};

	this.clickRegistration = function () {
		return this.expandNavbar()
			.then(registrationButton.click)
	};

	this.clickLoggedInUser = function () {
        return this.expandNavbar()
            .then(userDropdown.click)
    };

	this.clickLogout = function () {
        return this.expandNavbar()
            .then(logoutButton.click)
    };

	this.isUserLoggedIn = function () {
        return loginButton.isPresent()
            .then(function(result){
                return !result;
            });
    };
	
    this.getLoggedInUserName = function () {
        return this.expandNavbar()
			.then(userDropdown.getText)
			.then(function (text) {
				return text.trim();
            })
    };

    this.getUserDropdown = function () {
        return userDropdown;
    };

    this.getLoginModal = function() {
        return loginModal;
    };

    this.getLoginWarning = function () {
        return loginWarning;
    };

    this.closeLoginModal = function () {
        return closeLoginButton.click();
    };

	this.loginTypeInUsername = function (username) {
		return common.typeIn(loginInputUsername, username);
	};

	this.loginTypeInPassword = function (password) {
		return common.typeIn(loginInputPassword, password);
	};

    this.submitLogin = function () {
        return submitLoginButton.click();
    };

    this.clickPasswordReset = function () {
        return forgotPasswordLink.click();
    };
    
    this.passwordResetTypeInUsername = function (text) {
        return common.typeIn(registrationInputUsername, text); // Same Angular model binding as registration.
    };

    this.passwordResetTypeInEmail = function (text) {
        return common.typeIn(registrationInputEmail, text); // Same Angular model binding as registration.
    };

    this.passwordResetTypeInFirstname = function (text) {
        return common.typeIn(registrationInputFirstname, text); // Same Angular model binding as registration.
    };

    this.passwordResetTypeInLastname = function (text) {
        return common.typeIn(registrationInputLastname, text); // Same Angular model binding as registration.
    };

    this.passwordResetConfirmNoBot = function () {
        return registrationBotConfirm.click(); // Same Angular model binding as registration.
    };

    this.submitPasswordReset = function () {
        return submitRegistrationButton.click(); // Same Angular click binding as registration.
    };

    this.registrationTypeInUsername = function (text) {
        return common.typeIn(registrationInputUsername, text);
    };

    this.registrationTypeInPassword = function (text) {
        return common.typeIn(registrationInputPassword, text);
    };

    this.registrationTypeInPasswordValidation = function (text) {
        return common.typeIn(registrationInputPasswordValidation, text);
    };

    this.registrationTypeInFirstname = function (text) {
        browser.wait(EC.visibilityOf(registrationInputFirstname), 5000);
        return common.typeIn(registrationInputFirstname, text);
    };

    this.registrationTypeInLastname = function (text) {
        return common.typeIn(registrationInputLastname, text);
    };

    this.registrationTypeInEmail = function (text) {
        return common.typeIn(registrationInputEmail, text);
    };
    this.registrationTypeInEmailValidation = function (text) {
        return common.typeIn(registrationInputEmailValidation, text);
    };
    this.registrationTypeInInstitution = function (text) {
        return common.typeIn(registrationInputInstitution, text);
    };
    this.registrationTypeInHomepage = function (text) {
        return common.typeIn(registrationHomepage, text);
    };
    this.registrationTypeInZIP = function (text) {
        return common.typeIn(registrationInputZIP, text);
    };
    this.registrationTypeInPlace = function (text) {
        return common.typeIn(registrationInputPlace, text);
    };
    this.registrationTypeInStreet = function (text) {
        return common.typeIn(registrationInputStreet, text);
    };

    this.registrationSelectCountryByIndex = function (index) {
        return registrationDropdownCountryOptions.get(index).click();
    };

    this.registrationTypeInPhone = function (text) {
        return common.typeIn(registrationPhone, text);
    };

    this.registrationConfirmNoBot = function () {
        return registrationBotConfirm.click()
    };

    this.submitRegistration = function () {
        return submitRegistrationButton.click()
    };

    this.clickCancelRegistration = function () {
        return cancelRegistrationButton.click()
    };

    this.expandNavbar = function () {
        return collapsingNavbar.isDisplayed()
			.then(function(result) {
                if (!result) {
                    // console.log('Navbar is collapsed, clicking toggle.');
                    return element(by.css('.navbar-toggle')).click();
                }
                else {
                    // console.log('Navbar expanded. Doing nothing.');
                }
            })
    };

    this.typeInCompleteRegistrationCredentials = function () {
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
            .then(this.registrationSelectCountryByIndex(4))
            .then(this.registrationTypeInPhone(common.getTestUserPhone()))
            .then(this.registrationConfirmNoBot)
    }
};

module.exports = new NavbarPage();

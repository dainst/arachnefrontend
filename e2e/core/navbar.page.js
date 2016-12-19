var common = require('../common');

var NavbarPage = function() {

    var userDropdown = element(by.css('a[href*="bookmarks"]'));

	var loginButton = element(by.css('[ng-click="loginFunction();"]'));
	var loginInputUsername = element(by.id('input-username'));
	var loginInputPassword = element(by.id('exampleInputPassword2'));
    var submitLoginButton = element(by.id('submit-login'));
    var forgotPasswordLink = element(by.css('a[href*="pwdreset"]'));

    var logoutButton = element(by.css('[ng-click="logoutFunction();"]'));

    var registrationButton = element(by.css('a[href*="register"]'));
    var navbarRight = element(by.css('.navbar-right'));

    var registrationInputUsername = '';
    var registrationInputPassword = '';
    var registrationInputPasswordConfirm = '';
    var registrationInputFirstname = '';
    var registrationInputLastname = '';
    var registrationInputEmail = '';
    var registrationInputEmailConfirm = '';
    var registrationInputPLZ = '';
    var registrationInputCity = '';
    var registrationInputStreet = '';
    var registrationDropdownCountrySelection = '';
    var registrationBotConfirm = '';
    var submitRegistrationButton = '';
    var cancelRegistrationButton = '';

	this.clickLogin = function () {
        return this.openNavbar()
            .then(loginButton.click)
	};

	this.clickRegistration = function () {
		return this.openNavbar()
			.then(registrationButton.click)
			.then()
	};

	this.clickLoggedInUser = function () {
        return this.openNavbar()
            .then(userDropdown.click);
    };

	this.clickLogout = function () {
        return this.openNavbar()
            .then(logoutButton.click);
    };

	this.isUserLoggedIn = function () {
        return loginButton.isPresent()
            .then(function(result){
                if(result) {
                    return false;
                }
                else {
                    return true;
                }
            });
    };
	
    this.getLoggedInUserName = function () {
        return this.openNavbar()
			.then(userDropdown.getText)
			.then(function (text) {
				return text.trim();
            })
    };

	this.typeInUsername = function (username) {
		return common.typeIn(loginInputUsername, username);
	};

	this.typeInPassword = function (password) {
		return common.typeIn(loginInputPassword, password);
	};

	this.submitLogin = function () {
		return submitLoginButton.click();
    };

    this.openNavbar = function () {
        return navbarRight.isDisplayed()
			.then(function(result) {
                if (!result) {
                    // console.log('Navbar is collapsed, clicking toggle.');
                    return element(by.css('.navbar-toggle')).click();
                }
                else {
                    // console.log('Navbar not collapsed. Doing nothing.');
                }
            })
    };
};

module.exports = new NavbarPage();

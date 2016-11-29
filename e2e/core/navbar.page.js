var NavbarPage = function() {

	var loginButton = element(by.css('#loginbutton'));
	var loginModal = element(by.css('.modal-dialog'));

	this.getLoginModal = function() {
		return loginButton.click().then(function() {
			return loginModal;
		});
	};

}

module.exports = new NavbarPage();

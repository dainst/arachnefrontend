var EC = protractor.ExpectedConditions;

var MessageBoxPage = function() {
	
	var messageBox = element(by.css('.messages .alert'));
	var closeButton = element(by.css('.alert-message > .close'));

	this.getText = function() {
		return messageBox.getText();
	};

	this.getLevel = function() {
        browser.wait(EC.visibilityOf(messageBox), 5000);

		return messageBox.getAttribute('class').then(function(value) {
			var classes = value.split(' ');
			for (var i = 0; i < classes.length; i++) {
				var match = classes[i].match(/alert-(.+)/);
				if (match != null) return match[1];
			}
		});
	};

	this.close = function () {
		return closeButton.click();
    };
};

module.exports = new MessageBoxPage();
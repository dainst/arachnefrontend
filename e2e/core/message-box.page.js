var MessageBoxPage = function() {
	
	var messageBox = element(by.css('.messages .alert'));

	this.getText = function() {
		return messageBox.getText();
	};

	this.getLevel = function() {
		return messageBox.getAttribute('class').then(function(value) {
			var classes = value.split(' ');
			for (var i = 0; i < classes.length; i++) {
				var match = classes[i].match(/alert-(.+)/);
				if (match != null) return match[1];
			}
		});
	};

};

module.exports = new MessageBoxPage();
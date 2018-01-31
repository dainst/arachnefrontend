var EC = protractor.ExpectedConditions;

var MessageBoxPage = function() {
	
	var messageBox = element(by.css('.messages .alert'));
	var messageText = element(by.binding('message.text'));
	var closeButton = element(by.css('.alert-message > .close'));

    this.expectLevelToBe = function(expectation) {
        return expect(this.getLevel()).toEqualBecause(expectation);
    };

    this.close = function() {
        return closeButton.click();
    };

    this.enableCustomMessage = function() {
        var self = this;

        var matchers = {
            toEqualBecause: function(util, customEqualityTesters) {
                return {
                    compare: function(actual, expected) {
                        if (expected === undefined) {
                            expected = '';
                        }
                        var result = {};
                        result.pass = util.equals(actual, expected, customEqualityTesters);

                        if (!result.pass) {
                            result.message = "Expected '" + actual + "' to equal '" + expected + ". \nMessage is: '" + self.lastMessage + "'";
                        }
                        return result;
                    }
                }
            }
        };

        jasmine.addMatchers(matchers);
    };


	this.lastMessage = "";

    this.saveLastMessage = function() {
        return messageText.getText().then(
            function(text) {
                this.lastMessage = text;
            }.bind(this),
            function(){
                throw "[Message Box not present]";
            }
        );
    };

    this.saveLastMessageToError = function() {
        this.lastMessage = "[Message Box not present]";
    };

	this.getText = function() {
		return messageText.getText()
            .then(this.saveLastMessage());
	};

	this.getLevel = function() {
		return new Promise(function(resolve, reject) {
            browser.wait(EC.visibilityOf(messageBox), 150)
				.then(this.saveLastMessage())
                .catch(this.saveLastMessageToError())
				.then(function() {
					messageBox.getAttribute('class').then(
						function(value) {
							var classes = value.split(' ');
							for (var i = 0; i < classes.length; i++) {
								var match = classes[i].match(/alert-(.+)/);
								if (match !== null) {
									resolve(match[1]);
								}
							}
						}
					);
				});
		}.bind(this))
	};


};

module.exports = new MessageBoxPage();
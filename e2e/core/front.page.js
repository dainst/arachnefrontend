var FrontPage = function() {

	var entityCount = element(by.binding('entityCount'));
	
	this.load = function() {
        browser.get('/');
    };

    this.getEntityCount = function() {
    	return entityCount.getText();
    };

};

module.exports = new FrontPage();

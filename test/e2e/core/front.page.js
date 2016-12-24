var FrontPage = function() {

	var entityCount = element(by.binding('entityCount'));
	
	this.load = function() {
        browser.get('/');
    };

    this.getEntityCount = function() {
    	return entityCount.getText();
    };

    this.typeInSearchField = function(text) {
        var searchField = element(by.css('#start-page-search input'));
        for (var i in text) {
            searchField.sendKeys(text[i]);
        }
        return searchField;
    };

    this.getSearchButton = function() {
        return element(by.css('#start-page-search button'));
    };

};

module.exports = new FrontPage();

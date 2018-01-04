var common = require('../common');

var FrontPage = function() {

	var entityCount = element(by.binding('entityCount'));
	
	this.load = function() {
        return browser.get('/');
    };

    this.getEntityCount = function() {
    	return entityCount.getText();
    };

    this.typeInSearchField = function(text) {
        var searchField = element(by.css('#start-page-search input'));
        return common.typeInPromised(searchField, text);
    };

    this.getSearchButton = function() {
        return element(by.css('#start-page-search button'));
    };

};

module.exports = new FrontPage();

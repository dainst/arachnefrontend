var searchPage = require('../search/search.page');

var CategoryPage = function() {

	var resultSize = element(by.binding('resultSize'));

	var searchField = element(by.css('.category-search form input'));

	var searchButton = element(by.css('.category-search form button'));
	
	this.load = function(category) {
		var url = '/category/?c=' + category;
		browser.get(url);
	};

	this.getResultSize = function() {
		return new Promise(function(resolve, reject) {
			resultSize.getText().then(function(value) {
				value = value.replace(/[,.]/, "");
				resolve(parseInt(value));
			}, function(err) {
				reject(err);
			});
		});
	};

	this.startSearch = function(query) {
        searchField.sendKeys(query);
        searchButton.click();
		return searchPage;
	}

};

module.exports = new CategoryPage();
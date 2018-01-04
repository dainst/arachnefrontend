var searchPage = require('../search/search.page');

var CategoryPage = function() {

	var resultSize = element(by.binding('resultSize'));

	var searchField = element(by.css('.category-search form input'));

	var searchButton = element(by.css('.category-search form button'));
	
	this.load = function(category) {
		return new Promise(function(resolve, reject) {
            var url = '/category/?c=' + category;
            browser.get(url).then(function() {
                browser.waitForAngular().then(function() {
                    resolve();
                })
			})

		})
	};

	this.getResultSize = function() {
        return new Promise(function(resolve, reject) {
            return resultSize.getText().then(function(value) {
                value = value.replace(/[,.]/, "");
                resolve(parseInt(value));
            });
        });
	}

	this.startSearch = function(query) {
        searchField.sendKeys(query);
        searchButton.click();
		return searchPage;
	}

};

module.exports = new CategoryPage();
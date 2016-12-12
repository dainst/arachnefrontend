var querystring = require('querystring');

var SearchPage = function() {
	
	this.load = function(params) {
		var url = '/search';
		if (params) url += "?" + querystring.stringify(params);
		browser.get(url);
	};

	this.getFacetValues = function(facetName) {
		return element.all(by.css('.' + facetName + ' .facet-value'));
	};

	this.getMoreButton = function(facetName) {
		return element(by.css('.' + facetName + ' .more'));
	};

};

module.exports = new SearchPage();
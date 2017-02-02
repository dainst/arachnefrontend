var querystring = require('querystring');

var SearchPage = function() {
	
	this.load = function(params) {
		var url = '/search';
		if (params) url += "?" + querystring.stringify(params);
		browser.get(url);
	};

	this.getFacetPanel = function(facetName) {
		return element(by.css('.' + facetName + ' .panel-title'));
	};

	this.getFacetValues = function(facetName) {
		return element.all(by.css('.' + facetName + ' .facet-value'));
	};

	this.getMoreButton = function(facetName) {
		return element(by.css('.' + facetName + ' .more'));
	};

	this.getFacetButtons = function(facetName) {
		var facet = element(by.css('.facet.' + facetName));
		return facet.all(by.xpath('./ul/li/a'));
	};

	this.getResultSize = function() {
		return new Promise(function(resolve, reject) {
			element(by.binding('resultSize')).getText().then(function(resultSize) {
				resultSize = resultSize.replace(/[,.]/, "");
				resolve(parseInt(resultSize));
			}, function(err) {
				reject(err);
			});
		});
	};

	this.getEntityLinks = function() {
		return element.all(by.css('.ar-imagegrid-cell')).all(by.xpath('./a'));
	};

	this.getImages = function() {
		return element.all(by.css('.ar-imagegrid-cell')).all(by.xpath('./a/div/img'));
	};

};

module.exports = new SearchPage();
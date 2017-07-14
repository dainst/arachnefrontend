var querystring = require('querystring');
var common = require('../common');

var SearchPage = function() {
	
	this.load = function(params) {
		var url = '/search';
		if (params) url += "?" + querystring.stringify(params);
		browser.get(url);
	};

	this.loadScoped = function(scope, searchPage, params) {
		scope = (scope !== null) ? '/project/' + scope + '/': '/';
		searchPage = searchPage || 'search';
		var url = scope + searchPage;
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
				resultSize = resultSize.replace(/[,.]/g, "");
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

	this.getNavBarSearch = function() {
		return element(by.css('.idai-navbar-search > form > input[name="q"]'))
	}

	this.getNavBarSubmit = function() {
		return element(by.css('.idai-navbar-search > form > .input-group-btn > button'))
	}

	this.searchViaNavBar = function(what) {
		common.typeIn(this.getNavBarSearch(), what);
		this.getNavBarSubmit().click();
		//browser.pause()
		return browser.getCurrentUrl();
	}

	this.getScopeImage = function() {
		return element(by.css('.search-scope > a > div > img'));
	}



};

module.exports = new SearchPage();
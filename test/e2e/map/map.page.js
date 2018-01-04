var MapPage = function() {

	this.getHeatmap = function() {
		return element(by.css('.leaflet-heatmap-layer'));
	};

	this.getMarkers = function() {
		return element.all(by.css('.awesome-marker:not(.awesome-marker-shadow)'));
	};

	this.getZoomInButton = function() {
		return element(by.css('.leaflet-control-zoom-in'));
	};

	this.switchToSearchViewButton = function() {
		return element(by.css('.switch-to-search-view'));
	};

	this.switchToSearchView = function() {
		this.switchToSearchViewButton().click();
		return browser.getCurrentUrl();
	}


};

module.exports = new MapPage();
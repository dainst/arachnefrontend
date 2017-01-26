var MapPage = function() {
	
	var heatmapLayer = element(by.css('.leaflet-heatmap-layer'));

	this.getHeatmap = function() {
		return heatmapLayer;
	};

	this.getMarkers = function() {
		return element.all(by.css('.awesome-marker:not(.awesome-marker-shadow)'));
	};

	this.getZoomInButton = function() {
		return element(by.css('.leaflet-control-zoom-in'));
	}




};

module.exports = new MapPage();
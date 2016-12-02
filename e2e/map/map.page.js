var MapPage = function() {
	
	var heatmapLayer = element(by.css('.leaflet-heatmap-layer'));

	this.getHeatmap = function() {
		return heatmapLayer;
	}

	this.getMarkers = function () {
		return element.all(by.css('.awesome-marker'));
	}

}

module.exports = new MapPage();
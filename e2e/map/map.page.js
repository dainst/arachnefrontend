var MapPage = function() {
	
	var heatmapLayer = element(by.css('.leaflet-heatmap-layer'));

	this.getHeatmap = function() {
		return heatmapLayer;
	}

}

module.exports = new MapPage();
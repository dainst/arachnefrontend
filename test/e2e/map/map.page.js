function parseResultSize(resultSize) {
    return parseInt(resultSize.replace(/[,.]/g, ""));
}

var MapPage = function() {

	this.getHeatmap = function() {
		return element(by.css('.leaflet-heatmap-layer'));
	};

	this.getCircleMarkers = function() {
		return element.all(by.css('svg .leaflet-interactive'));
	};

    this.getLeafletPopup = function() {
        return element(by.css('.leaflet-popup'));
    };

    this.getCircleMarkerEntities = function() {
        return element.all(by.css('.leaflet-popup  li'));
    };

    this.getMarkers = function() {
        return element.all(by.css('.awesome-marker:not(.awesome-marker-shadow)'));
    };

	this.getZoomInButton = function() {
		return element(by.css('.leaflet-control-zoom-in'));
	};

    this.getTranlocationLines = function() {
        return element.all(by.css('svg path.translocation-line'));
    };

    this.getTranslocationsButton = function() {
        return element(by.css('#toggle-translocations'));
    };

    this.getResultSize = function() {
        return new Promise(function(resolve, reject) {
            var resultElem = element(by.css('#entity-count'));
            resultElem.getText().then(function(resultSize) {
                resolve(parseResultSize(resultSize));
            }, function(err) {
                reject(err);
            });
        });
    }

};

module.exports = new MapPage();

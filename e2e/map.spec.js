var EC = protractor.ExpectedConditions;
var map = require('./map/map.page');

describe('map', function() {
    it('should include a heatmap on the grako_map page', function() {
        browser.get('/project/grako_map');
        var heatmap = map.getHeatmap();
        expect(heatmap.isPresent()).toBe(true);
    });

    it('it should show som markers for small result size', function () {
        browser.get('/map?zoom=9&lat=53.92051610357605&lang=-7.429504394531251');
       	var marker = map.getMarkers();        
       	expect(marker.count()).not.toBeLessThan(1);
    });
});
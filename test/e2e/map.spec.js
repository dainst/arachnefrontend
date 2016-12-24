var EC = protractor.ExpectedConditions;
var map = require('./map/map.page');

describe('map', function() {
    it('should include a heatmap on the grako_map page', function() {
        browser.get('/project/grako_map');
        var heatmap = map.getHeatmap();
        expect(heatmap.isPresent()).toBe(true);
    });

    it('it should show som markers for small result size', function () {
        browser.get('/map?zoom=12&lat=50.42116487566384&lng=4.902398681640625');
       	var marker = map.getMarkers();        
       	expect(marker.count()).not.toBeLessThan(1);
    });
});
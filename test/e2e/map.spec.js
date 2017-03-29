var EC = protractor.ExpectedConditions;
var map = require('./map/map.page');

describe('map', function() {
    it('should include a heatmap on the grako_map page', function() {
        browser.get('/project/grako_map?lang=de');
        var heatmap = map.getHeatmap();
        expect(heatmap.isPresent()).toBe(true);
    });

    it('it should show some markers for small result size', function () {
        browser.get('/map?zoom=12&lat=50.42116487566384&lng=4.902398681640625');
       	var marker = map.getMarkers();        
       	expect(marker.count()).not.toBeLessThan(1);
    });

    xit('should show as many markers as many previous storage places exist', function() {

    	browser.get('/entity/1076902');

		browser.sleep(500).then(function() {
			var marker = map.getMarkers();
			expect(marker.count()).toBe(3);
		})

	})
});
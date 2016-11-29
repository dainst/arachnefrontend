var EC = protractor.ExpectedConditions;

var map = require('./map/map.page');

describe('map', function() {

    it('should include a heatmap on the grako_map page', function() {
        browser.get('/project/grako_map');
        var heatmap = map.getHeatmap();
        expect(heatmap.isPresent()).toBe(true);
    });

});
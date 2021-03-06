var EC = protractor.ExpectedConditions;
var map = require('./map/map.page');

describe('map', function() {
    it('should include a heatmap on the grako_map page', function() {
        browser.get('/project/grako_map?lang=de').then(function () {
            var heatmap = map.getHeatmap();
            expect(heatmap.isPresent()).toBe(true);
        });
    });

    it('it should show some markers for small result size', function () {
        browser.get('/map?zoom=12&lat=50.42116487566384&lng=4.902398681640625').then(function () {
       	    expect(map.getCircleMarkers().count()).toBeGreaterThanOrEqual(1);
        });
    });

    it('should show referenced entity list when clicking on markers', function () {
        browser.get('/map?zoom=12&lat=50.42116487566384&lng=4.902398681640625')
            .then(map.getCircleMarkers().first().click())
            .then(browser.wait(EC.visibilityOf(map.getLeafletPopup())))
            .then(function() {
                expect(map.getCircleMarkerEntities().isPresent()).toBe(true)
            })
    });

    it('should show as many markers as many previous storage places exist', function() {
    	browser.get('/entity/1076902').then(function() {
			expect(map.getMarkers().count()).toBe(3);
		})
	});

    it('should show translocationline on entity page', function() {
        browser.get('/entity/1076902')
            .then(expect(map.getTranlocationLines().count()).toBeGreaterThan(0));
    });

    it('should show translocationlines on map page when activated', function() {
        browser.get('/map?fl=1000&zoom=10&lat=50.42208136445244&lng=3.698959350585938')
            .then(map.getTranslocationsButton().click)
            .then(expect(map.getTranlocationLines().count()).toBeGreaterThan(0))
    });

});

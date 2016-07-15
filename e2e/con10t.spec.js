var EC = protractor.ExpectedConditions;

describe('con10t pages', function() {

    it('should contain markers on the grako_map page', function() {
    	browser.get('/project/grako_map');
        var marker = element(by.css('.leaflet-marker-icon'));
        browser.wait(EC.presenceOf(marker), 10000);
        expect(marker.isPresent).toBeTruthy();
    });

});
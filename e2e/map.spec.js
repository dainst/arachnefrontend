var EC = protractor.ExpectedConditions;

describe('con10t page', function() {

    it('should display a heatmap on the grako_map page', function(done) {

        browser.get('/project/grako_map');

        var heatmap = element(by.css('.leaflet-heatmap-layer'));

        console.log(heatmap);

        browser.wait(EC.presenceOf(heatmap), 5000);
        expect(heatmap.isPresent()).toBe(true);

        done();
    });

});


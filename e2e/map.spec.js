var EC = protractor.ExpectedConditions;

describe('con10t page', function() {

    fit('should display a heatmap on the grako_map page', function(done) {

        browser.driver.manage().window().setSize(1280, 1024);
        browser.get('/project/grako_map');
        browser.waitForAngular();

        var heatmap = element(by.css('.leaflet-heatmap-layer'));

        browser.wait(EC.presenceOf(heatmap), 7000);
        expect(heatmap.isPresent()).toBe(true);

        done();
    });

});


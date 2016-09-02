var EC = protractor.ExpectedConditions;

describe('con10t pages', function() {


    function click() {
        
        browser.waitForAngular();
        return element.all(by.css('.leaflet-control-zoom-in')).get(0).getText().click();
    }

    it('should contain markers on the grako_map page', function(done) {
        browser.get('/project/grako_map');

        click().then(click).then(click).then(click).then(click).then(function() {
            var marker = element(by.css('.leaflet-marker-icon'));
            browser.wait(EC.presenceOf(marker), 10000);
            expect(marker.isPresent()).toBe(true);
            done();
        })


    });

});


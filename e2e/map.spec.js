var EC = protractor.ExpectedConditions;

describe('con10t pages', function() {


    function click() {
        
        browser.waitForAngular();
        return element.all(by.css('.leaflet-control-zoom-in')).get(0).getText().click();
    }

    it('should contain markers on the grako_map page', function(done) {

        browser.driver.manage().window().setSize(1280, 1024);
        browser.get('/project/grako_map');

        click().then(click).then(click).then(click).then(click).then(click).then(click).then(function() {

            var marker = element(by.css('.awesome-marker'));
            browser.wait(EC.presenceOf(marker), 10000);
            expect(marker.isPresent()).toBe(true);
            done();
        })
    });

});


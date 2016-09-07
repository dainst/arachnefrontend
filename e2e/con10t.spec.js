var EC = protractor.ExpectedConditions;

fdescribe('con10t-image', function() {

    fit('should display an image from a given url', function() {
        browser.get('/project/steindorff');
        var marker = element(by.css('.con10t-image-fromsrc'));
        browser.wait(EC.presenceOf(marker), 10000);
        expect(marker.isPresent()).toBe(true);
    });

    it('should display an image from an arachne entity identifier', function() {
        browser.get('/project/schlossfulda');
        var marker = element(by.css('.con10t-image-fromentityid'));
        browser.wait(EC.presenceOf(marker), 10000);
        expect(marker.isPresent()).toBe(true);
    });

});


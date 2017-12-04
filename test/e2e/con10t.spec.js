var EC = protractor.ExpectedConditions;

var con10tImage = require('./con10t/con10t-image.page');

describe('con10t-image', function() {

    it('should display an image from a given url', function() {
        browser.get('/project/fotothekmuenchen');
        var image = con10tImage.getImageFromSrc();
        expect(image.isPresent()).toBe(true);
    });

    // TODO: schlossfulda or widgetsdemo url do not work, wait for testproject
    xit('should display an image from an arachne entity identifier', function() {
        browser.get('/project/widgetsdemo');
        var image = con10tImage.getImageFromEntity();
        expect(image.isPresent()).toBe(true);
    });

});

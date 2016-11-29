var EC = protractor.ExpectedConditions;

var con10tImage = require('./con10t/con10t-image.page');

describe('con10t-image', function() {

    it('should display an image from a given url', function() {
        browser.get('/project/steindorff');
        var image = con10tImage.getImageFromSrc();
        expect(image.isPresent()).toBe(true);
    });

    it('should display an image from an arachne entity identifier', function() {
        browser.get('/project/schlossfulda');
        var image = con10tImage.getImageFromEntity();
        expect(image.isPresent()).toBe(true);
    });

});

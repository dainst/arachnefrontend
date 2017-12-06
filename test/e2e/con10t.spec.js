var EC = protractor.ExpectedConditions;

var con10tWidget = require('./con10t/con10t-widget.page');

describe('con10t-image', function() {

    fit('should display an image from a given url', function() {
        browser.get('/project/test_project');
        var image = con10tWidget.getImageFromSrc();
        expect(image.isPresent()).toBe(true);
    });

    fit('should display an image from an arachne entity identifier', function() {
        browser.get('/project/test_project');
        var image = con10tWidget.getImageFromEntity();
        expect(image.isPresent()).toBe(true);
    });

});

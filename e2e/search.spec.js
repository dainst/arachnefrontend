/*
 * In order to prevent errors caused by e2e tests running too fast you can slow them down by calling the following
 * function. Use higher values for slower tests.
 *
 * utils.delayPromises(50);
 *
 */

describe('search result page', function() {

    it('should show facet more link when more facet values are available', function() {

        browser.get('/search?fl=1');

        var facetValues = element.all(by.css('.facet_image .facet-value'));
        var moreButton = element(by.css('.facet_image .more'));

        expect(moreButton.isDisplayed()).toBe(true);
        expect(facetValues.count()).toEqual(1);
        moreButton.click();
        expect(facetValues.count()).toEqual(2);
        expect(moreButton.isDisplayed()).toBe(true);
        moreButton.click();
        expect(facetValues.count()).toEqual(2);
        expect(moreButton.isDisplayed()).toBe(false);
    });

    it('should show a msg when searchresults exceed 10000', function(done) {
        browser.get('/search?offset=9995&limit=6&q=*');

        var messageBox = element(by.css('.alert-warning'));
        expect(messageBox.isDisplayed()).toBe(true);
        messageBox.element(by.css("b")).getText().then(function(text){
            expect(text).toContain("10000");
            done();
        });
    })
});

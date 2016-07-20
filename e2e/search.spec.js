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

});

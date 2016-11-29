/*
 * In order to prevent errors caused by e2e tests running too fast you can slow them down by calling the following
 * function. Use higher values for slower tests.
 *
 * utils.delayPromises(50);
 *
 */
var searchPage = require('./search/search.page');
var messageBox = require('./core/message-box.page');

describe('search result page', function() {

    it('should show facet more link when more facet values are available', function() {

        searchPage.load({ fl: 1 });

        var facetValues = searchPage.getFacetValues('facet_image');
        var moreButton = searchPage.getMoreButton('facet_image');

        expect(moreButton.isDisplayed()).toBe(true);
        expect(facetValues.count()).toEqual(1);
        moreButton.click();
        expect(facetValues.count()).toEqual(2);
        expect(moreButton.isDisplayed()).toBe(true);
        moreButton.click();
        expect(facetValues.count()).toEqual(2);
        expect(moreButton.isDisplayed()).toBe(false);
    });

    it('should show a msg when searchresults exceed 10000', function() {

        searchPage.load({ offset: 9995, limit: 6, q: '*' });

        expect(messageBox.getLevel()).toEqual('warning');
        expect(messageBox.getText()).toContain("10000");
        
    })
});

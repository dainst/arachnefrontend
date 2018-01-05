var searchPage = require('./search/search.page');
var messageBox = require('./core/message-box.page');

describe('search result page', function() {

    beforeEach(messageBox.enableCustomMessage);


    fit('should show facet more link when more facet values are available', function() {

        var facetValues = searchPage.getFacetValues('facet_image');
        var moreButton = searchPage.getMoreButton('facet_image');

        searchPage.load({fl: 1})
            .then(function() {
                expect(moreButton.isDisplayed()).toBe(true);
                expect(facetValues.count()).toEqual(1);
            })
            .then(moreButton.click())
            .then(function() {
                expect(facetValues.count()).toEqual(2);
                expect(moreButton.isDisplayed()).toBe(true);
            })
            .then(moreButton.click())
            .then(function() {
                expect(facetValues.count()).toEqual(2);
                expect(moreButton.isDisplayed()).toBe(false);
            });

    });

    it('should show a msg when searchresults exceed 10000', function(done) {

        searchPage.load({offset: 9995, limit: 6, q: '*'})
            .then(expect(messageBox.expectLevelToBe('warning')))
            .then(function() {
                expect(messageBox.lastMessage).toContain("10000")
            })
            .then(done)
            .catch(function(){
                done.fail(messageBox.lastMessage)
            })


        
    })
});

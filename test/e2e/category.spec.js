var categoryPage = require('./category/category.page');

describe('category page', function() {

	it('should display total number of entities for bauwerk', function() {

        categoryPage.load('bauwerk');
        categoryPage.getResultSize()
            .then(function(resultSize) {
                expect(resultSize).toBeGreaterThan(0);
            }
        );
    });

    xit('should only search for entities of displayed category', function() {

        categoryPage.load('objekt');
        var searchPage = categoryPage.startSearch('orest');
        searchPage.getFacetPanel('facet_objektgattung').click();
        var facetValues = searchPage.getFacetValues('facet_objektgattung');
        expect(facetValues.count()).toBeGreaterThan(0);
        
    });

});
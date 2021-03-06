var categoryPage = require('./category/category.page');

describe('category page', function() {

	it('should display total number of entities for bauwerk', function() {
        categoryPage.load('bauwerk')
            .then(expect(categoryPage.getResultSize()).toBeGreaterThan(0))
    });

    it('should only search for entities of displayed category', function() {

        categoryPage.load('objekt').then(function() {
            var searchPage = categoryPage.startSearch('orest');
            searchPage.getFacetPanel('facet_objektgattung').click();
            var facetValues = searchPage.getFacetValues('facet_objektgattung');
            expect(facetValues.count()).toBeGreaterThan(0);
        });

        
    });

});
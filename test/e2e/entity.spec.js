var entityPage = require('./entity/entity.page');

describe('entity page', function() {

    it('should load single entity by ID', function() {

        entityPage.load(5640)
            .then(function() {
                expect(entityPage.getEntityId().getText()).toEqual("5640");
            });
    });

    it('should page to next entity when resultIndex is set', function() {

        entityPage.load('', 'fq=facet_kategorie:"Typen"&resultIndex=3&q=*')
            .then(function() {
                expect(entityPage.getPreviousResultLink().isPresent()).toBe(true);
            })
            .then(entityPage.getNextResultLink().click)
            .then(function() {
                expect(entityPage.getEntityType().getText()).toEqual("Typen");
            });
    });

});

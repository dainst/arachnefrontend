var frontPage = require('./core/front.page');
var searchPage = require('./search/search.page');
var entityPage = require('./entity/entity.page');
var navbar = require('./core/navbar.page');

describe('basic scenarios', function() {

    beforeEach(function(){
        frontPage.load();
    });

    it('should have the total number of entities listed on the front page', function() {
        var entityCount = frontPage.getEntityCount();
        expect(entityCount).toMatch(/[0-9,.]/);
    });

    it('should open a login modal when the login button has been clicked on display devices with screenwidth >= 1280', function() {

        browser.driver.manage().window().setSize(1280, 1024)
            .then(navbar.clickLogin)
            .then(navbar.getLoginModal)
            .then(function(loginModal) {
                expect(loginModal.isPresent()).toBe(true);
            });
    });

    it('should search for entities, filter search results and show a single entity with linked entities', function(done) {

        var lastResultSize = 0;
        var lastEntitityId = 0;
        var linkedObjectSection = entityPage.getLinkedObjectSections().get(0);


        frontPage.typeInSearchField('Basilica Aemilia')
            .then(frontPage.getSearchButton().click())
            .then(searchPage.getResultSize)
            .then(function(resultSize){
                expect(resultSize).toBeGreaterThan(1000);
                expect(searchPage.getImages().count()).toBe(50);
                lastResultSize = resultSize;
            })

            .then(searchPage.getFacetButtons('facet_kategorie').get(1).click())
            .then(searchPage.getFacetButtons('facet_kategorie').get(1).click())
            .then(function() {
                searchPage.waitForChangedResultSize(lastResultSize);
            })
            .then(searchPage.getResultSize)
            .then(function(resultSize){
                expect(resultSize).toBeGreaterThan(0);
                expect(resultSize).toBeLessThan(lastResultSize);
                //expect(searchPage.getImages().count()).toBe(50);
                //lastResultSize = resultSize;
            })

            /*.then(searchPage.getFacetButtons('facet_image').get(0).click())
            .then(function() {
                searchPage.waitForChangedResultSize(lastResultSize);
            })
            .then(searchPage.getResultSize)
            .then(function(resultSize){
                expect(resultSize).toBeGreaterThan(0);
                expect(searchPage.getResultSize()).toBeLessThan(lastResultSize);
                expect(searchPage.getImages().count()).toBe(50);
            })

            .then(searchPage.getEntityLinks().get(0).click())
            .then(function(){
                expect(entityPage.getEntityTitle().isPresent()).toBe(true);
                expect(entityPage.getEntityId().isPresent()).toBe(true);
                expect(entityPage.getMainImage().getAttribute('complete')).toEqual('true');
               return entityPage.getEntityId();
            })
            .then(function(entitityId) {
                lastEntitityId = entitityId;
            })

            .then(entityPage.getLinkedObjectExpandButton(linkedObjectSection).click())
            .then(entityPage.getLinkedObjectEntryButtons(linkedObjectSection).get(1).click())
            .then(function() {
                expect(entityPage.getEntityTitle().isPresent()).toBe(true);
                expect(entityPage.getEntityId().isPresent()).toBe(true);
                expect(entityPage.getEntityId().getText()).not.toEqual(lastEntitityId)
            })*/

            .then(done)
            .catch(done.fail)

    });

    it('should show all entities when searching with empty query string', function() {

        frontPage.getSearchButton().click();
        var resultSize = searchPage.getResultSize().then(function(value) { return value; });
        expect(resultSize).toBeGreaterThan(1000000);

    });

});

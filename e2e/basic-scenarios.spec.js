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

        browser.driver.manage().window().setSize(1280, 1024);

        navbar.getLoginModal().then(function(loginModal) {
            expect(loginModal.isPresent()).toBe(true);
        });
    });

    it('should search for entities, filter search results and show a single entity with linked entities', function() {

        frontPage.typeInSearchField('Basilica Aemilia');
        frontPage.getSearchButton().click();

        var resultSize = searchPage.getResultSize().then(function(value) { return value; });
        expect(resultSize).toBeGreaterThan(1000);
        expect(searchPage.getImages().count()).toBe(50);

        searchPage.getFacetButtons('facet_kategorie').get(1).click();

        var resultSize2 = searchPage.getResultSize().then(function(value) { return value; });
        expect(resultSize2).toBeGreaterThan(0);
        expect(resultSize2).toBeLessThan(resultSize);
        expect(searchPage.getImages().count()).toBe(50);

        searchPage.getFacetButtons('facet_image').get(0).click();

        expect(resultSize2).toBeGreaterThan(0);
        expect(searchPage.getResultSize()).toBeLessThan(resultSize2);
        expect(searchPage.getImages().count()).toBe(50);

        searchPage.getEntityLinks().get(0).click();

        expect(entityPage.getEntityTitle().isPresent()).toBe(true);
        expect(entityPage.getEntityId().isPresent()).toBe(true);
        var entityId = entityPage.getEntityId().getText().then(function(value) { return value; });
        expect(entityPage.getMainImage().getAttribute('complete')).toEqual('true');

        var linkedObjectSection = entityPage.getLinkedObjectSections().get(0);
        entityPage.getLinkedObjectExpandButton(linkedObjectSection).click();
        entityPage.getLinkedObjectEntryButtons(linkedObjectSection).get(1).click();

        expect(entityPage.getEntityTitle().isPresent()).toBe(true);
        expect(entityPage.getEntityId().isPresent()).toBe(true);
        expect(entityPage.getEntityId().getText()).not.toEqual(entityId);
    });

});

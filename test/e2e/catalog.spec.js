var catalogPage = require('./catalog/catalog.page');
var entityPage = require('./entity/entity.page');
var common = require('./common');
var navbarPage = require('./core/navbar.page');

var rootChildrenCount = 2;
var subChildrenCount = 12;
var testCatalogId = null;

describe('catalog page', function() {

    beforeAll(function(done) {
        common.createTestCatalog()
            .then(function(id) {
                testCatalogId = id;
            })
            .then(done)
            .catch(function(e) {
                done.fail("Test catalog could not be created: " + e)
            });
    });

    afterAll(function(done) {
        common.deleteTestCatalog(testCatalogId)
        .then(done)
        .catch(done.fail);
    });

    it('should show more catalog entries on root level after each click on the more button', function(done) {
        if (testCatalogId) {
            catalogPage.load(testCatalogId)
                .then(catalogPage.getTreeRoot)
                .then(catalogPage.getChildrenList)
                .then(function(rootList) {
                    var rootEntries = catalogPage.getEntries(rootList);
                    expect(rootEntries.count()).toBe(rootChildrenCount);
                    catalogPage.getExpandButton(rootEntries.get(1)).click().then(function() {
                        var list = catalogPage.getEntries(catalogPage.getChildrenList(rootEntries.get(1)));
                        expect(list.count()).toBe(subChildrenCount)
                    })
                })
                .then(done)
                .catch(done.fail)
        } else {
            done(); // already failing in afterAll
        }
    });


    it('should show information about the selected catalog entry', function(done) {

        if (testCatalogId) {
            catalogPage.load(testCatalogId)
                .then(catalogPage.getCatalogTitle().click())
                .then(expect(catalogPage.getCatalogText().isPresent()).toBe(true))
                .then(function() {
                    return catalogPage.getRootEntries().get(0);
                })
                .then(catalogPage.getEntryLabel)
                .then(function(label) {return label.click()})
                .then(expect(catalogPage.getEntityTitle().isPresent()).toBe(true))
                .then(done)
                .catch(done.fail)
        } else {
            done(); // already failing in afterAll
        }

    });

    it('should show catalog on entity page', function(done) {
        if (testCatalogId) {
            browser.get('/entity/1121034')
                .then(navbarPage.clickLogin())
                .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
                .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
                .then(navbarPage.submitLogin())
                .then(expect(entityPage.getLinkedCatalogs().count()).toBeGreaterThan(0))
                .then(navbarPage.clickLoggedInUser())
                .then(navbarPage.clickLogout())
                .then(done)
                .catch(done.fail)
        } else {
            done(); // already failing in afterAll
        }
    });

});

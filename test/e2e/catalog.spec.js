var catalogPage = require('./catalog/catalog.page');
var rootChildrenCount = 2;
var subChildrenCount = 12;
var testCatalogId = null;

var common = require('./common');

common.deleteTestUserInDB();

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
                    catalogPage.getExpandButton(catalogPage.getEntries(rootList).get(1)).click().then(function() {
                        var list = catalogPage.getChildrenList(rootEntries.get(1));
                        expect(catalogPage.getEntries(list).count()).toBe(subChildrenCount);
                    })
                })
                .then(done)
                .catch(done.fail)
        } else {
            done(); // allready failing in afterAll
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
            done(); // allready failing in afterAll
        }


        /**
         * TODO
         *
         * catalog läd preview und text läd erst, wenn man auf catalog text clickt. das ändern und
         * expect(catalogPage.getCatalogText().isPresent()).toBe(true);
         *
         */

    });

    xit('should show markers in map view', function() {

        var width = 1024;
        var height = 768;

        browser.driver.manage().window().setSize(width, height)
            .then(catalogPage.load(testCatalogId))
            .then(expect(catalogPage.getMarkers().count()).toBe(0))
            .then(catalogPage.getMapButton().click())
            .then(expect(catalogPage.getMarkers().count()).toBeGreaterThan(0))

    });

    /**
     * TODO
     * dieser test muss fehlschlagen, weil die suche nur mit indizierten daten funktioniert.
     * bis es da eine schöne lösung gibt: xit.
     */

});

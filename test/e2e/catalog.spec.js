var catalogPage = require('./catalog/catalog.page');
var childrenLimit = 2;
var testCatalogId = null;

var common = require('./common');

describe('catalog page', function() {

    beforeAll(function(done) {
        common.createTestCatalog()
            .then(function(id) {
                testCatalogId = id;
            })
            .then(done)
            .catch(done.fail);
    });

    afterAll(function(done) {
        common.deleteTestCatalog(testCatalogId)
        .then(done)
        .catch(done.fail);
    });

    it('should show more catalog entries on root level after each click on the more button', function(done) {

        //catalogPage.load(common.getTestCatalogID())
        catalogPage.load(testCatalogId)
            .then(catalogPage.getTreeRoot)
            .then(catalogPage.getChildrenList)
            .then(function(rootList) {
                return expect(catalogPage.getEntries(rootList).count()).toBe(childrenLimit);
            })
            .then(done)
            .catch(done.fail)

            /*
                TODO test read more link
                for (var i = childrenLimit * 2; i <= childrenLimit * 4; i += childrenLimit) {
                    catalogPage.getMoreButton(rootList).click();
                    expect(catalogPage.getEntries(rootList).count()).toBe(i);
                }
            })*/
    });

    xit('should show more catalog entries on a lower level after each click on the more button', function() {

        catalogPage.load(79);
        var rootEntries = catalogPage.getRootEntries();

        catalogPage.getExpandButton(rootEntries.get(0)).click();

        var list = catalogPage.getChildrenList(rootEntries.get(0));
        var entries = catalogPage.getEntries(list);

        expect(entries.count()).toBe(childrenLimit);

        for (var i = childrenLimit * 2; i <= childrenLimit * 4; i += childrenLimit) {
            catalogPage.getMoreButton(list).click();
            expect(catalogPage.getEntries(list).count()).toBe(i);
        }
    });

    it('should show information about the selected catalog entry', function(done) {

        catalogPage.load(testCatalogId)
            //.then(browser.sleep(35000))
            .then(expect(catalogPage.getEntityTitle().isPresent()).toBe(false))
            .then(expect(catalogPage.getCatalogText().isPresent()).toBe(false))
            .then(function() {
                return catalogPage.getRootEntries().get(0);
            })
            .then(catalogPage.getEntryLabel)
            .then(function(label) {return label.click()})
            .then(expect(catalogPage.getEntityTitle().isPresent()).toBe(true))
            .then(browser.sleep(5000))
            .then(done)
            .catch(done.fail)

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
     * dieser test muss fehlschlagen, weil die suche nur mit indizierten daten funktioniert.
     * bis es da eine schöne lösung gibt: xit.
     */

});

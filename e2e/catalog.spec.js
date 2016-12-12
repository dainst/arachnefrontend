var catalogPage = require('./catalog/catalog.page');

describe('catalog page', function() {

    it('should show more catalog entries on root level after each click on the more button', function() {

        catalogPage.load(92);

        var treeRoot = catalogPage.getTreeRoot();
        var rootList = catalogPage.getChildrenList(treeRoot);

        expect(catalogPage.getEntries(rootList).count()).toBe(10);

        for (var i = 20; i <= 40; i += 10) {
            catalogPage.getMoreButton(rootList).click();
            expect(catalogPage.getEntries(rootList).count()).toBe(i);
        }
    });

    it('should show more catalog entries on a lower level after each click on the more button', function() {

        catalogPage.load(79);

        var treeRoot = catalogPage.getTreeRoot();
        var rootList = catalogPage.getChildrenList(treeRoot);
        var rootEntries = catalogPage.getEntries(rootList);

        catalogPage.getExpandButton(rootEntries.get(0)).click();

        var list = catalogPage.getChildrenList(rootEntries.get(0));
        var entries = catalogPage.getEntries(list);

        expect(entries.count()).toBe(10);

        for (var i = 20; i <= 40; i += 10) {
            catalogPage.getMoreButton(list).click();
            expect(catalogPage.getEntries(list).count()).toBe(i);
        }
    });

});

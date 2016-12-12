var CatalogPage = function() {

    this.load = function(id) {
        var url = '/catalog/' + id;
        browser.get(url);
    };

    this.getTreeRoot = function() {
        return element(by.id('tree-root'));
    };

    this.getChildrenList = function(entry) {
        return entry.element(by.xpath('./ol'));
    };

    this.getEntries = function(list) {
        return list.all(by.xpath('./li'));
    };

    this.getMoreButton = function(listRoot) {
        return listRoot.element(by.xpath('./div'));
    };

    this.getExpandButton = function(entry) {
        return entry.element(by.xpath('./div/a'));
    };

};

module.exports = new CatalogPage();
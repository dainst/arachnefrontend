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

    this.getRootEntries = function() {
        var treeRoot = this.getTreeRoot();
        var rootList = this.getChildrenList(treeRoot);
        return this.getEntries(rootList);
    };

    this.getMoreButton = function(listRoot) {
        return listRoot.element(by.xpath('./div'));
    };

    this.getExpandButton = function(entry) {
        return entry.element(by.xpath('./div/a'));
    };

    this.getEntryLabel = function(entry) {
        return entry.element(by.xpath('./div/span[@class=\'entry-label clickable ng-binding\']'));
    };

    this.getEntityTitle = function() {
        return element(by.css('.entity-title'));
    };

    this.getCatalogText = function() {
        return element(by.css('.catalog-text'));
    };

    this.getMapButton = function() {
        return element(by.id('catalog-map-button'));
    };

    this.getMarkers = function() {
        return element.all(by.css('.leaflet-marker-icon'));
    };

};

module.exports = new CatalogPage();
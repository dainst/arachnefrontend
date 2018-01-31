var common = require('../common');

var CatalogPage = function() {

    this.load = function(id) {
        var url = '/catalog/' + id;
        return  browser.get(url)
    };

    this.getCatalogTitle = function() {
        return element(by.css('.catalog-tree h3'));
    };

    this.getTreeRoot = function() {
        return element(by.id('tree-root'));
    };

    this.getChildrenList = function(entry) {
        return entry.all(by.css('ol')).first();
    };

    this.getEntries = function(list) {
        return list.all(by.css('li'));
    };

    this.getRootEntries = function() {
        return element.all(by.css('#tree-root > ol > li'));
    };

    this.getMoreButton = function(listRoot) {
        return listRoot.element(by.css('div'));
    };

    this.getExpandButton = function(entry) {
        return entry.all(by.css('div a')).first();
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
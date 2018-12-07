var EntityPage = function() {

    this.load = function(entityId, params='') {
        var url = '/entity/' + entityId + '?' + params;
        return browser.get(url);
    };

    this.getEntityId = function() {
        return element(by.id('entity-id-label'));
    };

    this.getEntityTitle = function() {
        return element(by.css('.entity-title'));
    };

    this.getEntityType = function() {
        return element(by.id('entity-type'));
    };

    this.getMainImage = function() {
        return element(by.id('maximg')).element(by.xpath('./img'));
    };

    this.getLinkedObjectSections = function() {
        return element.all(by.xpath('//div[@ar-facet-browser]/uib-accordion/div/div'));
    };

    this.getLinkedObjectExpandButton = function(section) {
        return section.element(by.xpath('./div[@class=\'panel-heading\']/h4/a'));
    };

    this.getLinkedObjectEntryButtons = function(section) {
        return section.all(by.xpath('./div/div[@class=\'panel-body\']/div/a'));
    };

    this.getLinkedCatalogs = function() {
        return element.all(by.css('a[href*="catalog/"]'));
    };

    this.getPreviousResultLink = function() {
        return element(by.id('entityPreviousResult'));
    };

    this.getNextResultLink = function() {
        return element(by.id('entityNextResult'));
    }

};

module.exports = new EntityPage();

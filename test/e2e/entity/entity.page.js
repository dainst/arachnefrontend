var EntityPage = function() {

    this.load = function(entityId) {
        var url = '/entity/' + entityId;
        browser.get(url);
    };

    this.getEntityTitle = function() {
        return element(by.css('.entity-title'));
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

};

module.exports = new EntityPage();

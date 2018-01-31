var EC = protractor.ExpectedConditions;

var Con10tWidgetPage = function() {
	
    var imageFromSrc = element(by.css('.con10t-image-fromsrc'));
    var imageFromEntity = element(by.css('.con10t-image-fromentityid'));
    var tocEntriesPage = element.all(by.css('.con10t-toc-entry'));
    var tocEntries = element.all(by.css('.con10t-toc-item'));
    var missingRightsOverlay = element(by.css('#restrictedContent .missingRightsOverlay'));
    var con10tLink = element(by.css('#con10tLink'));
    var subCatalogs = element.all(by.css('#catalogWidget .con10t-catalog-tree-child'));
    var treeLeaves = element.all(by.css('#treeWidget .con10t-tree-child .con10t-tree-child'));
    var treeLeaveOne = element.all(by.css('#treeWidget .con10t-tree-child:first-of-type .con10t-tree-child:first-of-type'));



    this.getImageFromSrc = function() {
    	return imageFromSrc;
    };

    this.getImageFromEntity = function() {
    	return imageFromEntity;
    };

    this.getTocEntryCount = function() {
        return tocEntries.count();
    };

    this.getTocEntryPageCount = function() {
        return tocEntriesPage.count();
    };

    this.getMissingRightsOverlay = function() {
        return missingRightsOverlay;
    };

    this.getCon10tLink = function() {
        return con10tLink;
    };

    this.getSubCatalogsCount = function() {
        return subCatalogs.count()
    };

    this.getTreeLeavesCount = function() {
        return treeLeaves.count();
    };



};

module.exports = new Con10tWidgetPage();
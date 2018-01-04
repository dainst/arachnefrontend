var Con10tWidgetPage = function() {
	
    var imageFromSrc = element(by.css('.con10t-image-fromsrc'));
    var imageFromEntity = element(by.css('.con10t-image-fromentityid'));

    this.getImageFromSrc = function() {
    	return imageFromSrc;
    };

    this.getImageFromEntity = function() {
    	return imageFromEntity;
    };
};

module.exports = new Con10tWidgetPage();
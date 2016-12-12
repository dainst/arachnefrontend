var frontPage = require('./core/front.page');
var navbar = require('./core/navbar.page');

describe('front page', function() {

    beforeEach(function(){
        frontPage.load();
    });

    it('should have the total number of entities listed on the front page', function() {
        var entityCount = frontPage.getEntityCount();
        expect(entityCount).toMatch(/[0-9,.]/);
    });

    it('should open a login modal when the login button has been clicked on display devices with screenwidth >= 1280', function() {

        browser.driver.manage().window().setSize(1280, 1024);

        navbar.getLoginModal().then(function(loginModal) {
            expect(loginModal.isPresent()).toBe(true);
        });
    });

});

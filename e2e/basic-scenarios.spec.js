/*
 * In order to prevent errors caused by e2e tests running too fast you can slow them down by calling the following
 * function. Use higher values for slower tests.
 *
 * utils.delayPromises(50);
 *
 */

describe('arachne 4 frontend', function() {

    beforeEach(function(){
        browser.get('/');
    });

    it('should have the total number of entities listed on the front page', function() {
        var entityCount = element(by.binding('entityCount'));
        expect(entityCount.isPresent()).toBe(true);
        expect(entityCount.getText()).toMatch(/[0-9,.]/);
    });

    it('should open a login modal when the login button has been clicked on display devices with screenwidth >= 1280', function() {

        browser.driver.manage().window().setSize(1280, 1024);
        var loginButton = element(by.css('#loginbutton'));
        expect(loginButton.isPresent()).toBe(true);

        browser.sleep(1500);

        loginButton.click();

        var loginModal = element(by.css('.modal-dialog '));
        expect(loginModal.isPresent()).toBe(true);
    });

});

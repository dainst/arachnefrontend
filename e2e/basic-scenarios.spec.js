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

    it('number of entities should be present', function() {
        var entityCount = element(by.binding('entityCount'));
        expect(entityCount.isPresent()).toBe(true);
        expect(entityCount.getText()).toMatch(/[0-9,.]/);
    });

});
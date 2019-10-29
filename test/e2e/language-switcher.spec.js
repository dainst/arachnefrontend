describe('language switcher', function() {

    it('opens a submenu which lets users to choose between german and english', function() {

        var languageSwitcher = element(by.id('language-switcher'));

        browser.get('/')
            .then(browser.wait(languageSwitcher.isPresent()))
            .then(expect(languageSwitcher.isPresent()).toBe(true))
            .then(languageSwitcher.click())
            .then(function() {
                expect(languageSwitcher.all(by.css('li')).get(0).getText()).toBe('Deutsch');
                expect(languageSwitcher.all(by.css('li')).get(1).getText()).toBe('English');
            });
    });

    it('changes the frontend\'s language from german to english', function() {

        var languageSwitcher = element(by.id('language-switcher'));

        browser.get('/')
            .then(browser.wait(languageSwitcher.isPresent()))
            .then(expect(languageSwitcher.isPresent()).toBe(true))
            .then(languageSwitcher.click())
            .then(languageSwitcher.all(by.css('li')).get(0).click())
            .then(browser.wait(languageSwitcher.isPresent()))
            .then(function(){
                expect(element.all(by.css('.navbar-links')).get(4).getText()).toBe('Über Arachne');
            })
            .then(languageSwitcher.click())
            .then(languageSwitcher.all(by.css('li')).get(1).click())
            .then(browser.wait(languageSwitcher.isPresent()))
            .then(function(){
                expect(element.all(by.css('.navbar-links')).get(4).getText()).toBe('About Arachne');
            });


    });

});

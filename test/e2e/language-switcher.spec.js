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
                expect(element.all(by.css('.navbar-links')).get(3).getText()).toBe('Über Arachne');
                expect(element.all(by.css('.all-projects')).get(0).getText()).toBe('Alle Projekte anzeigen');
            })
            .then(languageSwitcher.click())
            .then(languageSwitcher.all(by.css('li')).get(1).click())
            .then(browser.wait(languageSwitcher.isPresent()))
            .then(function(){
                expect(element.all(by.css('.navbar-links')).get(3).getText()).toBe('About Arachne');
                expect(element.all(by.css('.all-projects')).get(0).getText()).toBe('Show all projects');
            });


    });

});
describe('language switcher', function() {

    it('opens a submenu which lets users to choose between german and english', function() {

        browser.get('/');

        browser.wait(function() {
            return element(by.id('language-switcher')).isPresent();
        }, 1000);

        var languageSwitcher = element(by.id('language-switcher'));

        expect(languageSwitcher.isPresent()).toBe(true);

        languageSwitcher.click();

        expect(languageSwitcher.all(by.css('li')).get(0).getText()).toBe('Deutsch');
        expect(languageSwitcher.all(by.css('li')).get(1).getText()).toBe('English');

    });

    it('changes the frontends language from german to english', function() {

        browser.get('/');

        browser.wait(function() {
            return element(by.id('language-switcher')).isPresent();
        }, 1000);

        var languageSwitcher = element(by.id('language-switcher'));

        expect(languageSwitcher.isPresent()).toBe(true);

        languageSwitcher.click();

        // Set frontends language to german
        languageSwitcher.all(by.css('li')).get(0).click();

        browser.wait(function() {
            return element(by.id('language-switcher')).isPresent();
        }, 1000);

        expect(element.all(by.css('.navbar-links')).get(3).getText()).toBe('Über Arachne');
        expect(element.all(by.css('.all-projects')).get(0).getText()).toBe('Alle Projekte anzeigen');

        languageSwitcher.click();

        // Set frontends language to english
        languageSwitcher.all(by.css('li')).get(1).click();

        browser.wait(function() {
            return element(by.id('language-switcher')).isPresent();
        }, 1000);

        expect(element.all(by.css('.navbar-links')).get(3).getText()).toBe('About Arachne');
        expect(element.all(by.css('.all-projects')).get(0).getText()).toBe('Show all projects');

        languageSwitcher.click();

        // Set frontends language to german, again
        languageSwitcher.all(by.css('li')).get(0).click();

    });

});
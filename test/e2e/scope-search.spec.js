var searchPage = require('./search/search.page');
var mapPage = require('./map/map.page');
var messageBox = require('./core/message-box.page');

describe('scoped search result page', function() {


    it('shall have the same results for scopes search or for manually set scope', function() {

        searchPage.loadScoped('afrarchcologne', 'search', { fl: 1 });

		searchPage.getResultSize().then(function(count) {

			searchPage.load({
                q: '*',
				fq: 'facet_bestandsname:"AAArC"',
				fl: 1
			});

			searchPage.getResultSize().then(function (count2) {
                expect(count === count2).toEqual(true);

			})
		})


    });

	it('shall search in the right scope when searching via the nav bar', function() {
		searchPage.loadScoped('afrarchcologne', 'search', { fl: 1 });
		searchPage.searchViaNavBar('okapi').then(function(newUrl) {
		   expect(newUrl).toEqual("/project/afrarchcologne/search?q=okapi");
        });
	});

	it('shall search on map page when navbar search is used on map page', function() {
		searchPage.loadScoped(null, 'map', {});
		searchPage.searchViaNavBar('okapi').then(function(newUrl) {
			expect(newUrl).toContain("/map?q=okapi");
		});
	});

	it('shall stay in scope when switched to normal search view', function() {
		searchPage.loadScoped(null, 'map', {q:"okapi"});
		mapPage.switchToSearchView().then(function(newUrl) {
			expect(newUrl).toContain("/search?q=okapi");
		})
	});

	it('shall also search on map page when navbar search is used on map page in scoped search', function() {
		searchPage.loadScoped('grako', 'map', {});
		searchPage.searchViaNavBar('Florenz').then(function(newUrl) {
			expect(newUrl).toContain("project/grako/map?q=Florenz");
		});
	});

	it('shall stay in scope when switched to normal search view  in scoped search', function() {
		searchPage.loadScoped('grako', 'map', {q:"Florenz"});
		mapPage.switchToSearchView().then(function(newUrl) {
			expect(newUrl).toContain("project/grako/search?q=Florenz");
		})
	});


	it('shall load the right logo in scoped search', function() {

		searchPage.loadScoped('afrarchcologne', 'search', { fl: 1 });
		browser.driver.sleep(500);
		browser.waitForAngular();
		var scopelogo = element(by.css("img[src*='/project/afrarchcologne/search-scope.jpg']"));
		expect(scopelogo.isPresent()).toBe(true);

	});

	it('forward to scopeless search if scope is not defined', function() {

		searchPage.loadScoped('_unknown_scope_', 'search', { fl: 1 });
		searchPage.searchViaNavBar('heroes for ghosts').then(function(newUrl) {
			expect(newUrl).not.toContain("_unknown_scope_");
		});

	});

});

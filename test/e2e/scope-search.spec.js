var searchPage = require('./search/search.page');
var mapPage = require('./map/map.page');
var common = require('./common');

describe('scoped search result page', function() {


    it('shall have the same results for scopes search or for manually set scope', function() {
        var count = null;
    	searchPage.loadScoped('afrarchcologne', 'search', {fl: 1})
			.then(searchPage.getResultSize)
			.then(function(result) {count = result})
			.then(searchPage.load({
                q: '*',
                fq: 'facet_bestandsname:"AAArC"',
                fl: 1
            }))
            .then(searchPage.getResultSize)
            .then(function (count2) {
                expect(count).toEqual(count2);
            })

    });

	it('shall search in the right scope when searching via the nav bar', function() {
		searchPage.loadScoped('afrarchcologne', 'search', {fl: 1})
			.then(searchPage.searchViaNavBar('okapi'))
			.then(function(newUrl) {
		   		expect(newUrl).toContain("/project/afrarchcologne/search?q=okapi");
        	});
	});

	it('shall search on map page when navbar search is used on map page', function() {
		searchPage.loadScoped(null, 'map', {})
			.then(searchPage.searchViaNavBar('okapi'))
			.then(function(newUrl) {
				expect(newUrl).toContain("/map?q=okapi");
			});
	});

	it('shall stay in scope when switched to normal search view', function() {
		searchPage.loadScoped('grako', 'map', {q:"okapi"})
			.then(common.switchView('tiles'))
            .then(function(newUrl) {
                expect(newUrl).toContain("q=okapi");
            })
	});

	it('shall also search on map page when navbar search is used on map page in scoped search', function() {
		searchPage.loadScoped('grako', 'map', {})
			.then(searchPage.searchViaNavBar('Florenz'))
			.then(function(newUrl) {
				expect(newUrl).toContain("project/grako/map?q=Florenz");
			});
	});

	it('shall stay in scope when switched to normal search view in scoped search', function() {
		searchPage.loadScoped('grako', 'map', {q:"Florenz"})
			.then(common.switchView('tiles'))
            .then(function(newUrl) {
                expect(newUrl).toContain("project/grako/search?q=Florenz");
            });
	});

	it('shall load the right logo in scoped search', function() {
		searchPage.loadScoped('afrarchcologne', 'search', { fl: 1 })
			.then(function() {
                var scopelogo = element(by.css("img[src*='afrarchcologne/search-logo.jpg']"));
                expect(scopelogo.isPresent()).toBe(true);
			});
	});

	it('forward to scopeless search if scope is not defined', function() {
		searchPage.loadScoped('_unknown_scope_', 'search', { fl: 1 })
			.then(searchPage.searchViaNavBar('heroes for ghosts'))
			.then(function(newUrl) {
				expect(newUrl).not.toContain("_unknown_scope_");
			});
	});
});

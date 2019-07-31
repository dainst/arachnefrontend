var EC = protractor.ExpectedConditions;

var con10tWidget = require('./con10t/con10t-widget.page');
var common = require('./common');
var navbarPage = require('./core/navbar.page');



describe('con10t-widget', function() {

    afterAll(common.deleteTestUserInDB);

    it('image block should display an image from a given url', function() {
        browser.get('/project/test_project')
            .then(function() {
                var image = con10tWidget.getImageFromSrc();
                expect(image.isPresent()).toBe(true);
            });

    });

    it('image block should display an image from an arachne entity identifier', function() {
        browser.get('/project/test_project')
            .then(function() {
                var image = con10tWidget.getImageFromEntity();
                expect(image.isPresent()).toBe(true);
            });

    });

    it('should make a nice table of contents bfrom all toc-entries in page', function(done) {
        var tocEntriesCount;
        browser.get('/project/test_project')
            .then(con10tWidget.getTocEntryCount)
            .then(function(tec) {
                tocEntriesCount = tec;
            })
            .then(con10tWidget.getTocEntryPageCount)
            .then(function(tecp) {
                expect(tocEntriesCount).toBe(tecp);
            })
            .then(done)
            .catch(done.fail)

    });

    it('block restricted content if not logged in', function(done) {
        browser.get('/project/test_project')
            .then(expect(con10tWidget.getMissingRightsOverlay().isDisplayed()).toBe(true))
            .then(common.createTestUserInDB())
            .then(navbarPage.clickLogin())
            .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
            .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
            .then(navbarPage.submitLogin())
            .then(expect(con10tWidget.getMissingRightsOverlay().isDisplayed()).toBe(false))
            .then(navbarPage.clickLoggedInUser())
            .then(navbarPage.clickLogout())
            .then(done)
            .catch(done.fail);
    });

    it('link widget should create link to entity', function() {
        browser.get('/project/test_project')
            .then(expect(con10tWidget.getCon10tLink().getAttribute('href')).toContain("entity/5447718"));

    });

    it('catalog widget should show catalog', function() {
        // TODO use dynamic test catalog here...
        browser.get('/project/test_project')
            .then(con10tWidget.getSubCatalogsCount)
            .then(function(scc) {
                expect(scc).toBe(2);
            });
    });

    it('tree widget should content tree', function() {
        browser.get('/project/test_project')
            .then(con10tWidget.getTreeLeavesCount)
            .then(function(scc) {
                 expect(scc).toBeGreaterThan(0);
                // note: check out amount of tree leaves for test_project ("facet_bestandsname:..."), data might be changed.
            });
    });

    // map widget and search widget are tested enough in other test suites

});

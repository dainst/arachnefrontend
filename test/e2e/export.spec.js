var frontPage = require('./core/front.page');
var searchPage = require('./search/search.page');
var exportDialog = require('./export/export-dialog');
var exportPage = require('./export/export.page');
var navbarPage = require('./core/navbar.page');
var common = require('./common');
var catalogPage = require('./catalog/catalog.page');


describe('data export', function() {

    var testCatalogId = null;

    beforeEach(exportDialog.cleanDownloads);

    beforeAll(function(done) {
        common.deleteTestUserInDB()
            .then(common.createTestCatalog)
            .then(function(id) {
                testCatalogId = id;
            })
            .then(done);
    });

    afterEach(function(done) {
        exportPage.cleanStack().then(done).catch(console.warn).then(done);
    });

    afterAll(function(done) {

        common.deleteTestCatalog(testCatalogId)
            .then(frontPage.load("/"))
            .then(navbarPage.clickLoggedInUser())
            .then(navbarPage.clickLogout())
            .then(done)
            .catch(done.fail);
    });

    it('should directly download small csv exports', function() {
        searchPage.load({q: 'Yoloaiquin'}).then(function() {
            exportDialog.exportBtn.click();
            exportDialog.export('csv').then(function(contents) {
                var rows = contents.split("\n");
                var columns = rows.length ? rows[0].split(",") : 0;
                expect(rows.length > 3).toBeTruthy();
                expect(columns.length > 5).toBeTruthy();
            });
        });
    });

    it('should directly download small pdf exports', function() {
        searchPage.load({q: 'Yoloaiquin'}).then(function() {
            exportDialog.exportBtn.click();
            exportDialog.export('pdf').then(function(contents) {
                var rows = contents.split("\n");
                var first = rows.length ? rows[0] : "";
                expect(first).toEqual("%PDF-1.4");
            });
        });
    });

    it('should refuse large exports', function() {
        searchPage.load({q: '*'}).then(function() {
            exportDialog.exportBtn.click();
            exportDialog.export('pdf')
                .then(function(contents) {
                    throw new Error("(Job should be refused)");
                })
                .catch(function(messageType) {
                    expect(messageType).toContain('alert-danger');
                })

        });
    });


    it('should enqueue big export if user is logged in', function(done) {
        var taskStatus = null;

        frontPage.load()
            .then(navbarPage.clickLogin())
            .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
            .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
            .then(navbarPage.submitLogin())
            .then(navbarPage.waitForLogin())
            .then(searchPage.load({q: 'baumstamm'}))
            .then(exportDialog.exportBtn.click())
            .then(function() {
                exportDialog.export('pdf')
                    .then(function(contents) {
                        throw new Error("(Job should be enqueued)");
                    })
                    .catch(function(messageType) {
                        expect(messageType).toContain('alert-success');
                    });
            })

            .then(exportPage.load())
            .then(function() {
                taskStatus = exportPage.getJobClass();
            })

            .then(function() {
                expect(taskStatus).toContain('panel-info');
            })
            .then(done)
            .catch(done.fail);
    });

    it('should export catalog', function(done) {
        if (testCatalogId) {
            catalogPage.load(testCatalogId)
                .then(function () {
                    exportDialog.exportBtn.click();
                    exportDialog.export('csv').then(function (contents) {
                        var rows = contents.split("\n");
                        var columns = rows.length ? rows[0].split(",") : 0;
                        expect(rows.length > 18).toBeTruthy();
                        expect(columns.length === 63).toBeTruthy();
                    });
                })
                .then(done)
                .catch(done.fail);
        } else {
            done(); // already failing in afterAll
        }

    });

});
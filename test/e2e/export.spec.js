var frontPage = require('./core/front.page');
var searchPage = require('./search/search.page');
var exportDialog = require('./export/export-dialog');
var exportPage = require('./export/export.page');
var navbarPage = require('./core/navbar.page');
var common = require('./common');
var EC = protractor.ExpectedConditions;


describe('data export', function() {

    beforeEach(exportDialog.cleanDownloads);

    beforeAll(function(done) {
        common.deleteTestUserInDB()
            .then(common.createTestUserInDB)
            .then(done);
    });

    afterAll(common.deleteTestUserInDB);

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
                    expect(false).toEqual(true);
                })
                .catch(function(messageType) {
                    expect(messageType).toContain('alert-danger');
                })

        });
    });

    // #10198 has to be fixed first
    xit('should enqueue big export if user is logged in', function() {
        frontPage.load()
            .then(navbarPage.clickLogin())
            .then(navbarPage.loginTypeInUsername(common.getTestUserName()))
            .then(navbarPage.loginTypeInPassword(common.getTestUserPassword()))
            .then(navbarPage.submitLogin())
            .then(navbarPage.waitForLogin())
            .then(function() {
                searchPage.load({q: 'baumstamm'})
            })
            .then(function() {
                exportDialog.exportBtn.click();
                exportDialog.export('pdf')
                    .then(function(contents) {
                        expect(false).toEqual(true);
                    })
                    .catch(function(messageType) {
                        expect(messageType).toContain('alert-success');
                        exportPage.load().then(function() {
                            browser.sleep(5000);

                            // exportPage.getJob()
                            //     .then(function(cls) {
                            //         console.log("CLS", cls);
                            //         expect(cls).toContain('panel-success');
                            //     })
                            //     .catch(function(x) {
                            //         console.log("NOTFOUND",x);
                            //     })
                        })


                    });
            });
    });


});
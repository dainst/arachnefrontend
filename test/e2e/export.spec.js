var searchPage = require('./search/search.page');
var exportDialog = require('./export/export-dialog');


describe('data export', function() {

    beforeEach(exportDialog.cleanDownloads);

    it('directly download small csv exports', function() {
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

    it('directly download small pdf exports', function() {
        searchPage.load({q: 'Yoloaiquin'}).then(function() {
            exportDialog.exportBtn.click();
            exportDialog.export('pdf').then(function(contents) {
                var rows = contents.split("\n");
                var first = rows.length ? rows[0] : "";
                expect(first).toEqual("%PDF-1.4");
            });
        });
    });

    it('refuse large exports', function() {
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



});
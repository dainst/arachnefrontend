var EC = protractor.ExpectedConditions;


var exportDialog = function() {

    this.exportBtn = element.all(by.css('button[ng-click="openDownloadDialog()"]')).first();

    this.cleanDownloads = function() {
        [
            '/tmp/export.csv',
            '/tmp/export.pdf',
            '/tmp/export.html'
        ].forEach(function(file) {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
    };

    this.export = function(type) {
        return new Promise(function(resolve, reject) {
            var button = element(by.css('#download-as-' + type));
            var exportMessage = element(by.css('#download-message'));
            var filename = "/tmp/export." + type;
            browser.wait(EC.visibilityOf(button))
                .then(function() {
                    button.click();
                    element(by.css('#download-go')).click();

                    browser.wait(EC.visibilityOf(exportMessage), 50)
                        .then(function() {
                            exportMessage.getAttribute('class').then(reject);
                        })
                        .catch(function() {
                            browser.driver.wait(function() {return fs.existsSync(filename);}, 30000)
                                .then(function() {
                                    var contents = fs.readFileSync(filename, {encoding: 'utf8'});
                                    resolve(contents);
                                })
                        });
                })
                .catch(reject)
        });
    }
};

module.exports = new exportDialog();

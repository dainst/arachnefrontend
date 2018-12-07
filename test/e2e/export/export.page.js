var EC = protractor.ExpectedConditions;

var exportPage = function() {

    this.load = function() {
        var url = '/admin/dataexport';
        return browser.get(url);
    };

    this.getJob = function() {
        var job = element(by.css('#projectLogo'));
        return browser.wait(EC.visibilityOf(job), 5);
    };

    this.getJobClass = function() {
        //var job = element(by.css('.export-job:first-child'));

        return new Promise(function(resolve, reject) {
            browser.wait(EC.presenceOf(job), 5)
                .then(function() {
                    //job.getAttribute('class')
                    resolve("a");
                })
                .catch(function() {
                    resolve("");
                })
        });
    }

};

module.exports = new exportPage();

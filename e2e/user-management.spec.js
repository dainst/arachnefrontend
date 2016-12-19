var frontPage = require('./core/front.page');
var navbarPage = require('./core/navbar.page');
var messageBox = require('./core/message-box.page');

var common = require('./common');

fdescribe('user management page', function () {

    beforeAll(function () {
        // Create user
    });

    beforeEach(function(){
        frontPage.load();
    });

    it('should be able to login and logout', function () {
        navbarPage.clickLogin()
            .then(navbarPage.typeInUsername(common.getTestUserName()))
            .then(navbarPage.typeInPassword(common.getTestUserPassword()))
            .then(navbarPage.submitLogin)
            .then(function () {
                return navbarPage.getLoggedInUserName();
            })
            .then(function (name) {
                expect(name).toEqual(common.getTestUserName());
            })
            .then(function() {
                return navbarPage.clickLoggedInUser();
            })
            .then(function() {
                return navbarPage.clickLogout();
            })
            .then(function () {
                expect(navbarPage.isUserLoggedIn()).toBe(false);
            })
    });

    afterAll(function () {
        // Delete user
    })
});
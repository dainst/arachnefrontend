import ContactController from './contact.controller.js';
import contactService from './contact.service.js';
import EditUserController from './edit-user.controller.js';
import LoginFormController from './login-form.controller.js';
import LoginController from './login.controller.js';
import PwdActivationController from './pwd-activation.controller.js';
import PwdActivation from './pwd-activation.resource.js';
import PwdChangeController from './pwd-change.controller.js';
import PwdChange from './pwd-change.resource.js';
import PwdResetController from './pwd-reset.controller.js';
import PwdReset from './pwd-reset.resource.js';
import RegisterController from './register.controller.js';

export default angular.module('arachne.users', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider.state({ name: 'register', url: '/register', template: require('./register.html') });
        $stateProvider.state({ name: 'editUser', url: '/editUser', template: require('./edit-user.html') });
        $stateProvider.state({ name: 'contact', url: '/contact', template: require('./contact.html') });
        $stateProvider.state({ name: 'pwdreset', url: '/pwdreset', template: require('./pwd-reset.html') });   
        $stateProvider.state({ name: 'pwdchange', url: '/pwdchange', template: require('./pwd-change.html') });   
        $stateProvider.state({ name: 'userActivation', url: '/user/activation/:token', template: require('./pwd-activation.html') });   
        $stateProvider.state({ name: 'login', url: '/login', template: require('./login.html') });
    }])
    .controller('ContactController', ['$scope', 'contactService', 'transl8', 'messageService', ContactController])
    .factory('contactService', ['arachneSettings', '$resource', contactService])
    .controller('EditUserController', ['$scope', '$http', 'arachneSettings', 'authService', 'messageService', '$timeout', 'transl8', EditUserController])
    .controller('LoginFormController', ['$scope', '$uibModalInstance', 'authService', '$timeout', LoginFormController])
    .controller('LoginController', ['$uibModal', '$window', 'authService', '$stateParams', LoginController])
    .controller('PwdActivationController', ['$scope', '$stateParams', '$filter', '$location', 'PwdActivation', 'messageService', PwdActivationController])
    .factory('PwdActivation', ['$resource', 'arachneSettings', PwdActivation])
    .controller('PwdChangeController', ['$scope', '$location', 'PwdChange', 'messageService', '$filter', PwdChangeController])
    .factory('PwdChange', ['$resource', 'arachneSettings', PwdChange])
    .controller('PwdResetController', ['$scope', '$location', 'PwdReset', 'messageService', PwdResetController])
    .factory('PwdReset', ['$resource', 'arachneSettings', PwdReset])
    .controller('RegisterController', ['$scope', '$http', '$filter', 'messageService', 'arachneSettings', '$location', RegisterController])
;

import SvgController from './svg.controller.js';

export default angular.module('arachne.svg', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider.state({ name: 'svg', url: '/svg?id', template: require('./svg.html'), controller: 'SvgController' });
    }])
    .controller('SvgController', ['$scope', '$http', '$location', 'arachneSettings', SvgController]);

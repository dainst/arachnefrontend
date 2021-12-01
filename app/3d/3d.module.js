import ThreeDimensionalController from './three-dimensional.controller.js';
import ThreedviewerDirective from './threedviewer.directive.js';

export default angular.module('arachne.3d', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider.state({ name: '3d', url: '/3d?id', template: require('./3d.html'), controller: 'ThreeDimensionalController' });
    }])
    .controller('ThreeDimensionalController', ['$scope', '$location', '$http', '$uibModal', 'arachneSettings', '$rootScope', ThreeDimensionalController])
    .directive('threeDViewer', ThreedviewerDirective);

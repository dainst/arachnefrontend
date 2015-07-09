'use strict';

angular.module('arachne.controllers')


/**
 * @author: Daniel M. de Oliveira
 */

.controller('StaticController', ['$scope', '$routeParams', 'language',
    function ($scope, $routeParams, language) {
        $scope.templateUrl = 'static/de/'+$routeParams.name+'.html';
    }
]);
'use strict';

angular.module('arachne.controllers')

/**
 * Handles requests for the state of the document import.
 *
 * Uses: $scope.templateUrl
 *
 * @author: Sebastian Cuy
 * @author: Daniel M. de Oliveira
 */
.controller('ProjectController', ['$scope', '$routeParams', 'language', '$http',
    function ($scope, $routeParams, language, $http) {


        $scope.templateUrl='con10t/de/'+$routeParams.name+'.html';
        console.log($scope.templateUrl)

        /**$http.get($scope.templateUrl)
         .success(
         function(){
			console.log('success');
         })
         .error(
         function(){
            console.log('error');
         })*/
    }
]);
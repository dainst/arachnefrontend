'use strict';

angular.module('arachne.controllers')


/**
 * @author: Daniel M. de Oliveira
 * @author: Sebastian Cuy
 */
.controller('ProjectsController', ['$scope', '$http',
    function ($scope, $http ) {

        $scope.columns = [];
        $http.get('con10t/projects.json').success(function(data){

            $scope.projects = data[0].children;

            // TODO adjust title according to language
            // for now, set it to german language

            for (var i=0;i<$scope.projects.length;i++){ // 1st order elements
                $scope.projects[i].title=$scope.projects[i].title['de'];

                if (! $scope.projects[i].children) continue;


                for (var j=0;j<$scope.projects[i].children.length;j++){ // 2nd order elements

                    $scope.projects[i].children[j].title=$scope.projects[i].children[j].title['de'];
                    if (! $scope.projects[i].children[j].children) continue;

                    for (var k = 0; k < $scope.projects[i].children[j].children.length; k++) { // 3nd order elements
                        $scope.projects[i].children[j].children[k].title = $scope.projects[i].children[j].children[k].title['de'];
                    }

                }

            }

            $scope.columns[0] = $scope.projects.slice(0,3);
            $scope.columns[1] = $scope.projects.slice(3,5);
            $scope.columns[2] = $scope.projects.slice(5);
        });
    }
]);
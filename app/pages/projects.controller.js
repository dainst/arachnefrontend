'use strict';

angular.module('arachne.controllers')


/**
 * $scope
 *   columns - an array of 3 elements which each
 *   represent a column of project items.
 *
 * @author: Daniel de Oliveira
 * @author: Sebastian Cuy
 */
    .controller('ProjectsController', ['$scope', '$http', 'localizedContent',
        function ($scope, $http, localizedContent) {

            $scope.columns = [];

            $http.get('con10t/content.json').then(function (result) {

                var data = result.data;
                localizedContent.reduceTitles(data);
                $scope.sliceColumns(data.children);
            }).catch(function () {
                console.log(error);
            });

            $scope.sliceColumns = function (projects) {
                
                $scope.columns[0] = projects.slice(0, 3);
                $scope.columns[1] = projects.slice(3, 5);
                $scope.columns[2] = projects.slice(5);
            };
        }
    ]);

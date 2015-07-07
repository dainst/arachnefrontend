'use strict';

angular.module('arachne.controllers')


/**
 * TODO adjust title according to language
 *   for now, set it to german language
 *
 * @author: Daniel M. de Oliveira
 * @author: Sebastian Cuy
 */
.controller('ProjectsController', ['$scope', '$http',
    function ($scope, $http ) {

        var restructureByLang = function(el,lang){
            el.title=el.title[lang];
            el.selectedLang=lang;
        }

        var restructureRecursively = function(el){

            restructureByLang(el,'de');

            if (! el.children) return;
            for (var i=0;i<el.children.length;i++) {
                restructureRecursively(el.children[i]);
            }
        }

        $scope.columns = [];
        var sliceColumns = function(){
            $scope.columns[0] = $scope.projects.slice(0,3);
            $scope.columns[1] = $scope.projects.slice(3,5);
            $scope.columns[2] = $scope.projects.slice(5);
        }

        $http.get('con10t/projects.json').success(function(data){
            $scope.projects = data[0].children;

            for (var i=0;i<$scope.projects.length;i++)
                restructureRecursively($scope.projects[i]);

            sliceColumns();
        });
    }
]);
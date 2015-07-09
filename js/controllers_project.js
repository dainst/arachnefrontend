'use strict';

angular.module('arachne.controllers')


/**
 * @author: Sebastian Cuy
 * @author: Daniel M. de Oliveira
 */

.controller('ProjectController', ['$scope', '$routeParams', '$http', '$location', 'language', 'languageSelection',
    function ($scope, $routeParams, $http, $location, language, languageSelection) {

        var PROJECTS_JSON = 'con10t/projects.json';

        $scope.templateUrl="";

        var isProjectSiteAvailable = function(lang,projects) {

            for (var i=0; i< projects.length;i++) {
                if (projects[i].id==$routeParams.name&&projects[i].title[lang]) return true;
                if (projects[i].children){
                    for (var j=0; j< projects[i].children.length;j++) {
                       if (projects[i].children[j].id==$routeParams.name&&projects[i].children[j].title[lang]) return true;
                       if (projects[i].children[j].children)
                           for (var k=0; k< projects[i].children[j].children.length;k++) {
                               if (projects[i].children[j].children[k].id==$routeParams.name&&projects[i].children[j].children[k].title[lang]) return true;
                           }
                    }
                }
            }
            return false;
        }



        var setTemplateUrlForLang = function(lang,projects) {
            $scope.templateUrl='con10t/'+lang+'/'+$routeParams.name+'.html';
        }



        if ($location.search()['lang']==undefined){
            $http.get(PROJECTS_JSON).success(function(data){
                var projects = data[0].children;
                languageSelection.__ (language.__(),isProjectSiteAvailable,setTemplateUrlForLang,projects);
            });
        }
        else
            $scope.templateUrl = 'con10t/'+$location.search()['lang']+'/'+$routeParams.name+'.html';

    }
]);
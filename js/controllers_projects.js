'use strict';

angular.module('arachne.controllers')


/**
 * Reads the project structure from PROJECTS_JSON 
 * and adjusts the titles of projects to only appear
 * in one language for the view. The shown language 
 * for each project's title gets chosen by considering
 * the users primary selected browser language and 
 * the translations available for each title.
 *
 * @see: ../docs/feature_localization_con10t.md
 * @see: ../spec/controllers_projects_spec.js 
 *
 * @author: Daniel M. de Oliveira
 * @author: Sebastian Cuy
 */
.controller('ProjectsController', ['$scope', '$http', 'language', 'languageSelection',
    function ($scope, $http, language, languageSelection) {

		var PROJECTS_JSON = 'con10t/projects.json';


		var adjustTitleForLang = function(lang,project) {
        	project.title=project.title[lang];
		}

        var isTitleAvailableForLang = function (lang,project) {
            return project.title[lang];
        }

        var recurseProjectsToAdjustTitle = function(project){

            languageSelection.__ (language.__(),isTitleAvailableForLang,adjustTitleForLang,project);

            if (! project.children) return;
            for (var i=0;i<project.children.length;i++) {
                recurseProjectsToAdjustTitle(project.children[i]);
            }
        }

        $scope.columns = [];
        var sliceColumns = function(){
            $scope.columns[0] = $scope.projects.slice(0,3);
            $scope.columns[1] = $scope.projects.slice(3,5);
            $scope.columns[2] = $scope.projects.slice(5);
        }

        $http.get(PROJECTS_JSON).success(function(data){
            $scope.projects = data[0].children;

            for (var i=0;i<$scope.projects.length;i++)
                recurseProjectsToAdjustTitle($scope.projects[i]);

            sliceColumns();
        });
    }
]);

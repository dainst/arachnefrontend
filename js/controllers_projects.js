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
 * @see: ../spec/ProjectsControllerSpec.js 
 *
 * @author: Daniel M. de Oliveira
 * @author: Sebastian Cuy
 */
.controller('ProjectsController', ['$scope', '$http', 'language',
    function ($scope, $http, language ) {

		var PROJECTS_JSON = 'con10t/projects.json';
		var GERMAN_LANG = 'de';
		var ENGLISH_LANG = 'en';

		var adjustTitle = function(project,lang) {
        	project.title=project.title[lang];
        	project.selectedLang=lang;
		}

        var reduceTitleBasedOnLang = function(project){
			
			if (language.__()==GERMAN_LANG){
            	adjustTitle(project,GERMAN_LANG)
				return;
			}
			
			if (project.title[language.__()]){
            	adjustTitle(project,language.__());
			} else if (language.__()==ENGLISH_LANG){
	            adjustTitle(project,GERMAN_LANG);
            } else if (project.title[ENGLISH_LANG])
	            adjustTitle(project,ENGLISH_LANG);
			else 
				adjustTitle(project,GERMAN_LANG);
			
        }

        var recurseProjectsToAdjustTitle = function(project){

            reduceTitleBasedOnLang(project);

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

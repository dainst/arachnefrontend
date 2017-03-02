'use strict';

angular.module('arachne.controllers')

    .controller('WelcomePageController', ['$rootScope', '$scope', '$http', 'arachneSettings', 'messageService', '$timeout',
        function ($rootScope, $scope, $http, arachneSettings, messages, $timeout) {

            $rootScope.hideFooter = false;

            $http.get('con10t/front.json').success(function (projects) {
                $scope.projects = projects;

                if ((navigator.language || navigator.userLanguage) === 'de') {
                    $scope.lang = 'de';
                } else {
                    $scope.lang = 'en';
                }
            });

            $http.get(arachneSettings.dataserviceUri + "/entity/count").success(function (data) {
                $scope.entityCount = data.entityCount;
            }).error(function (data) {
                $timeout(function(){
                    messages.add("backend_missing");
                }, 500);
            });
        }
    ]);
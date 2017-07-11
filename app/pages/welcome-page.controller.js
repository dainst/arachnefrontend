'use strict';

angular.module('arachne.controllers')

    .controller('WelcomePageController', ['$rootScope', '$scope', '$http', '$sce', 'arachneSettings', 'messageService', '$timeout',
        function ($rootScope, $scope, $http, $sce, arachneSettings, messages, $timeout) {

            $rootScope.hideFooter = false;

            $http.get('con10t/front.json').then(function (result) {

                $scope.projects = result.data;

                var lang = navigator.language || navigator.userLanguage;

                if (lang === 'de' || lang === 'de-de') {
                    $scope.lang = 'de';
                } else {
                    $scope.lang = 'en';
                }
            });

            $http.get(arachneSettings.dataserviceUri + "/entity/count")
                .then(function (result) {
                    $scope.entityCount = result.data.entityCount;
                }).catch(function () {
                $timeout(function () {
                    messages.add("backend_missing");
                }, 500);
            });
        }
    ]);
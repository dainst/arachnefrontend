'use strict';

angular.module('arachne.controllers')

    .controller('StartSiteController', ['$rootScope', '$scope', '$http', 'arachneSettings', 'messageService', '$timeout',
        function ($rootScope, $scope, $http, arachneSettings, messages, $timeout) {

            $rootScope.hideFooter = false;

            $http.get('con10t/front.json').success(function (projectsMenu) {
                var projslides = $scope.projslides = [];
                for (var key in projectsMenu) {
                    projslides.push({
                        image: "con10t/frontimages/" + projectsMenu[key].id + ".jpg",
                        title: projectsMenu[key].text,
                        id: projectsMenu[key].id
                    });
                }
                $scope.active = Math.floor((Math.random() * $scope.projslides.length));

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
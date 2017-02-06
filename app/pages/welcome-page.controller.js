'use strict';

angular.module('arachne.controllers')

    .controller('WelcomePageController', ['$rootScope', '$scope', '$http', 'arachneSettings', 'messageService', '$timeout',
        function ($rootScope, $scope, $http, arachneSettings, messages, $timeout) {

            $rootScope.hideFooter = false;
            $scope.position = 3;

            $http.get('con10t/front.json').success(function (projectsMenu) {
                var projslides = $scope.projslides = [];
                for (var key in projectsMenu) {
                    projslides.push({
                        image: "con10t/frontimages/" + projectsMenu[key].id + ".jpg",
                        title: projectsMenu[key].text,
                        id: projectsMenu[key].id
                    });
                }
                $scope.activeSlides = $scope.projslides.slice(0,3);

            });

            $http.get(arachneSettings.dataserviceUri + "/entity/count").success(function (data) {
                $scope.entityCount = data.entityCount;
            }).error(function (data) {
                $timeout(function(){
                    messages.add("backend_missing");
                }, 500);
            });

            $scope.nextProject = function() {
                var pos = ++$scope.position % $scope.projslides.length;
                $scope.activeSlides.push($scope.projslides[pos]);
                $scope.activeSlides.shift();
            }

        }
    ]);
'use strict';

angular.module('arachne.controllers')


.controller('DataexportController', ['$scope', '$http', '$timeout', 'arachneSettings', 'authService', 'messageService',
    function ($scope, $http, $timeout, arachneSettings, authService, messageService) {

        $scope.status = {
            tasks: {}
        };

        $scope.dataserviceUri = arachneSettings.dataserviceUri;

        $scope.user = authService.getUser();

        $scope.hasTasks = function() {
             return (Object.keys($scope.status.tasks).length > 0);
        };

        $scope.restoreUrl = function(url) {
            var regex = /(\/data)(.*)([&?]mediaType=.*)([&#].*)?/gm;
            var parts = regex.exec(url);
            return parts[2] + (angular.isDefined(parts[4]) ? parts[4] : '');
        };

        $scope.cancelTask = function(taskId) {
            $http.post(arachneSettings.dataserviceUri + '/export/cancel/' + taskId).then(
                function(response) {
                    // do nothing
                },
                function(response) {
                    messageService.add('data_export_could_not_abort', 'warning');
                    console.warn('Error:', response);
                }
            );
        };

        $scope.clearTask = function(taskId) {
            delete $scope.status.tasks[taskId];
            $http.post(arachneSettings.dataserviceUri + '/export/clean/' + taskId).then(
                function(response) {
                    // do nothing
                },
                function(response) {
                    messageService.add('data_export_could_not_clean', 'warning');
                    console.warn('Error:', response);
                }
            );
        };

        function fetchStatus() {
            if (!$scope.user) {
                messageService.add('ui_not_logged_in', 'warning');
            }


            $http.get(arachneSettings.dataserviceUri + '/export/status').then(
                function(response) {
                    $scope.status = response.data;
                    $timeout.cancel(timeout);
                    timeout = $timeout(fetchStatus, 10000);
                },
                function(response) {
                    console.warn('Error:', response);
                    $scope.status = {
                        tasks: {},
                        error: response.data
                    };
                }
            );
        }

        var timeout = $timeout(fetchStatus, 1);
        $scope.$on('$destroy', function(){
            $timeout.cancel(timeout);
        });



    }]);
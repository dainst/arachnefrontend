'use strict';

angular.module('arachne.controllers')


.controller('DataexportController', ['$scope', '$http', '$timeout', 'arachneSettings', 'authService',
    function ($scope, $http, $timeout, arachneSettings, authService) {

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

        function fetchStatus() {
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
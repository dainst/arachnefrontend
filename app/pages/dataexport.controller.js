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

        function fetchStatus() {
            $http.get(arachneSettings.dataserviceUri + '/export/status').then(
                function(response) {
                    console.log('res', response);
                    $scope.status = response.data;
                    $timeout.cancel(timeout);
                    timeout = $timeout(fetchStatus, 10000);
                },
                function(response) {
                    console.warn('Error:', response);
                }
            );
        }

        var timeout = $timeout(fetchStatus, 1);
        $scope.$on('$destroy', function(){
            $timeout.cancel(timeout);
        });
    }]);
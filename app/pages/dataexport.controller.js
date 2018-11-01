'use strict';

angular.module('arachne.controllers')


.controller('DataexportController', ['$scope', '$http', '$location', '$interval', 'arachneSettings',
    function ($scope, $http, $location, $interval, arachneSettings) {

        $scope.status = [];

        function fetchStatus() {
            $http.get(arachneSettings.dataserviceUri + '/export/status').then(
                function(response) {
                    console.log('res', response);
                    $scope.status = response.data;
                },
                function(response) {
                    console.log('ERRRres', response);
                }
            );
        }

        fetchStatus();


    }]);
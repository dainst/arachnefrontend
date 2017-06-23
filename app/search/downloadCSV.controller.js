'use strict';

angular.module('arachne.controllers')

/**
 * @author Patrick Jominet
 */
    .controller('DownloadCSVController', ['$scope', '$uibModalInstance', 'searchService', 'arachneSettings',
        function ($scope, $uibModalInstance, searchService, arachneSettings) {

            $scope.currentQuery = searchService.currentQuery();
            var limit = $scope.limit = 100;
            // dynamic filename if more modes are added later
            var mode = 'csv';
            $scope.filename = 'currentSearch.' + mode;
            $scope.dlMode = mode.toUpperCase();

            // could be extended with a parameter defining the mode if more modes are used later
            $scope.downloadAs = function () {
                var currentQuery = $scope.currentQuery;
                if (limit === 'other')
                    limit = $scope.actual;
                return arachneSettings.dataserviceUri + '/search.' + mode + '?q=' + currentQuery.q + '&fl=' + limit;
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
        }]);

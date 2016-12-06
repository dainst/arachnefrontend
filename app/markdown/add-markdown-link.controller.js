'use strict';

angular.module('arachne.controllers')

    .controller('AddMarkdownLinkController', ['$scope', '$uibModalInstance', 'link',
        function ($scope, $uibModalInstance, link) {
            $scope.link = link;
        }
    ]);

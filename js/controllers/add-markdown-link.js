'use strict';

angular.module('arachne.controllers', ['ui.bootstrap'])

    .controller('AddMarkdownLinkController', ['$scope', '$uibModalInstance', 'link',
        function ($scope, $uibModalInstance, link) {
            $scope.link = link;
        }
    ]);

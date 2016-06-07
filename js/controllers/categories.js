'use strict';

angular.module('arachne.controllers')

    .controller('CategoriesController', ['$rootScope', '$scope', '$http', 'categoryService',
        function ($rootScope, $scope, $http, categoryService) {

            $rootScope.hideFooter = false;

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = [];
                for (var key in categories) {
                    if (categories[key].status != 'none') {
                        $scope.categories.push(categories[key]);
                    }
                }
            });
        }
    ]);
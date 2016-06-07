'use strict';

angular.module('arachne.controllers')

    .controller('SearchFormController', ['$scope', '$location', function ($scope, $location) {

            $scope.search = function (fq) {
                if ($scope.q) {
                    var url = '/search?q=' + $scope.q;
                    if (fq) url += "&fq=" + fq;
                    $scope.q = null;
                    $location.url(url);
                }
            }

        }
    ]);
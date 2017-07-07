'use strict';

angular.module('arachne.controllers')

    .controller('ManageEditorController', ['$scope', '$http', 'arachneSettings', 'messageService', '$uibModalInstance', 'catalog',
        function ($scope, $http, arachneSettings, messages, $uibModalInstance, catalog) {
            $scope.catalog = catalog;
            $scope.usernames = [];

            $scope.getUsernames = function() {

                $scope.usernames = [];
                var url;
                for (var i = 0; i < $scope.catalog.userIds.length; i++) {

                    url = arachneSettings.dataserviceUri + '/userid/' + $scope.catalog.userIds[i];
                    $http.get(url)
                        .then(function (result) {

                            var user = result.data;
                            if (user != null) {
                                $scope.usernames.push(user.username);
                            }
                        });
                }
            };

            $scope.getUsernames();

            $scope.add = function(username) {

                var url = arachneSettings.dataserviceUri + '/userinfo/' + username;

                $http.get(url)
                    .then(function (result) {

                        var user = result.data;
                        if(user == null) {
                            messages.add('ui_user_not_found', 'warning', false);
                        }
                        else {
                            if (user.groupID >= 600 && (catalog.userIds.indexOf(user.id) == -1)) {
                                catalog.userIds.push(user.id);
                                $scope.getUsernames();
                            }
                            else {
                                messages.add('catalog_no_editor', 'warning', false);
                            }
                        }
                    });
            };

            $scope.remove = function (username) {

                if(catalog.userIds.length > 1) {

                    var url = arachneSettings.dataserviceUri + '/userinfo/' + username;

                    $http.get(url)
                        .then(function (result) {

                            var user = result.data;

                            if (user != null) {
                                if (catalog.userIds.indexOf(user.id) != -1) {
                                    catalog.userIds.splice(catalog.userIds.indexOf(user.id), 1);
                                    $scope.getUsernames();
                                }
                                else {
                                    messages.add('', 'danger', true);
                                }
                            }
                            else {
                                messages.add('', 'danger', true);
                            }
                        });
                }
                else {
                    messages.add('catalog_atleast_one_editor', 'warning', false);
                }
            }
        }
    ]);
'use strict';

angular.module('arachne.controllers')

    .controller('MessageController', ['$scope', 'message',
        function ($scope, message) {

            $scope.messages = message.getMessages();

            $scope.removeMessage = function (index) {
                message.removeMessage(index);
            }

        }
    ]);
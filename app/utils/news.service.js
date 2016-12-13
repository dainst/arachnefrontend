'use strict';

angular.module('arachne.services')

    .factory('newsFactory', ['$http', 'arachneSettings',
        function ($http, arachneSettings) {
            var factory = {};
            factory.getNews = function () {
                return $http.get(arachneSettings.dataserviceUri + '/news/de');
            };
            return factory;
        }]);
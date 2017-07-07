'use strict';

angular.module('arachne.services')

    .factory('newsFactory', ['$http', '$sce', 'arachneSettings',
        function ($http, $sce, arachneSettings) {
            var factory = {};
            factory.getNews = function () {
                return $http.get(arachneSettings.dataserviceUri + '/news/de');
            };
            return factory;
        }]);
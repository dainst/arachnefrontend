'use strict';

angular.module('arachne.services')

.factory('categoryService', ['$http', '$filter',
function($http, $filter){

    var categories = null;

    var promise = $http.get('config/category.json').then(function(response) {
        categories = {};
        for (var key in response.data) {
            categories[key] = response.data[key];
            categories[key]['title'] = $filter('transl8')('type_' + key);
            categories[key]['singular'] = $filter('transl8')('type_singular_' + key);
            categories[key]['subtitle'] = $filter('transl8')('type_subtitle_' + key);
            categories[key]['href'] = 'category/?c=' + key;
        }
        return categories;
    });

    var factory = {};

    factory.getCategoriesAsync = function() {
        return promise;
    };

    factory.getCategories = function() {
        return categories;
    };

    factory.getSingular = function(category) {
        if (categories && category in categories && "singular" in categories[category]) {
            return categories[category].singular;
        } else {
            return category;
        }
    };

    return factory;
}]);
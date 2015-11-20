'use strict';

angular.module('arachne.services')

.factory('categoryService', ['$http',
function($http ){

    var categories = null;

    var promise = $http.get('config/category.json').then(function(response) {
        categories = response.data;
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
        if (category in categories && "singular" in categories[category]) {
            return categories[category].singular;
        } else {
            return category;
        }
    };

    return factory;
}]);
'use strict';

angular.module('arachne.services')

.factory('categoryService', ['$http', '$filter', '$q', 'transl8',
function($http, $filter, $q, transl8){

    var categories = null;

    var deferred = $q.defer();
    transl8.onLoaded().then(function() {
        $http.get('config/category.json').then(function (response) {

            categories = {};
            for (var key in response.data) {
                
                categories[key] = response.data[key];
                categories[key]['title'] = $filter('transl8')('type_' + key);
                categories[key]['queryTitle'] = response.data[key].queryTitle;
                categories[key]['singular'] = $filter('transl8')('type_singular_' + key);
                categories[key]['subtitle'] = $filter('transl8')('type_subtitle_' + key);
                categories[key]['href'] = 'category/?c=' + key;
            }
            deferred.resolve(categories);
        });
    });

    var factory = {};

    factory.getCategoriesAsync = function() {
        return deferred.promise;
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

    factory.getCategoryHref = function(categoryName) {

        return this.getCategoriesAsync().then(function(result) {

            var cur;
            for (var category in result) {
                cur = result[category];
                if (cur.queryTitle === categoryName) {
                    return cur.href;
                }
            }
            return false;
        });
    };

    return factory;
}]);
import CategoriesController from './categories.controller.js';
import CategoryController from './category.controller.js';
import categoryService from './category.service.js';

export default angular.module('arachne.category', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider.state({ name: 'categories', url: '/categories', template: require('./categories.html')});
        $stateProvider.state({ name: 'category',  url: '/category/?c&facet&fv&group', template: require('./category.html')});
    }])
    .controller('CategoriesController', ['$rootScope', '$scope', '$filter', 'categoryService', CategoriesController])
    .controller('CategoryController', ['$rootScope', '$scope', '$uibModal', 'Query', '$http', 'arachneSettings', 'categoryService', '$location', 'Entity', '$filter', 'indexService', CategoryController])
    .factory('categoryService', ['$filter', '$q', 'transl8', categoryService])
;

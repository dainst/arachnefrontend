angular.module('arachne.filters')

    .filter('singular', ['categoryService', function (categoryService) {
        return function (plural) {
            return categoryService.getSingular(plural);
        }
    }]);
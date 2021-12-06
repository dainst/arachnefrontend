import arScopedHref from './ar-scoped.directive.js';
import arSearchScope from './ar-search-scope.directive.js';
import searchScope from './search-scope.service.js';

export default angular.module('arachne.scope', [])
    .directive('arScopedHref', ['searchScope', arScopedHref])
    .directive('arSearchScope', ['$q', 'searchScope', arSearchScope])
    .factory('searchScope', ['$location', '$http', '$stateParams', 'language', '$state', searchScope])
;

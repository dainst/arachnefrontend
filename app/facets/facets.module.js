import arActiveFacets from './ar-active-facets.directive.js';
import arFacetBrowser from './ar-facet-browser.directive.js';
import IndexController from './index.controller.js';
import indexService from './index.service.js';

export default angular.module('facets', [])
    .directive('arActiveFacets', arActiveFacets)
    .directive('arFacetBrowser', ['Entity', arFacetBrowser])
    .controller('IndexController', ['$scope', 'categoryService', 'Entity', 'Query', '$stateParams', '$location', 'indexService', IndexController])
    .factory('indexService', ['$filter', 'Entity', '$http', 'Query', '$q', indexService])
;

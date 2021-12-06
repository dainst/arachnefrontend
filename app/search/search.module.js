import arSearchNav from './ar-search-nav.directive.js';
import con10tSearchCatalog from './con10t-search-catalog.directive.js';
import con10tSearchQuery from './con10t-search-query.directive.js';
import con10tSearch from './con10t-search.directive.js';
import FacetValueModalController from './facet-value-modal.controller.js';
import Query from './query.prototype.js';
import SearchController from './search.controller.js';
import searchService from './search.service.js';
import scopeModule from '../scope/scope.module.js';
import imageModule from '../image/image.module.js';
import cellsFromEntities from './cells-from-entities.filter.js';

export default angular.module('arachne.search', [scopeModule.name, imageModule.name])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider.state({ name: 'search',  url: '/search?q&fq&view&sort&offset&limit&desc&bbox&ghprec&group', template: require('./search.html')});
    }])
    .directive('arSearchNav', ['arachneSettings', arSearchNav])
    .directive('con10tSearchCatalog', con10tSearchCatalog)
    .directive('con10tSearchQuery', ['$location', con10tSearchQuery])
    .directive('con10tSearch', ['$location', '$filter', con10tSearch])
    .controller('FacetValueModalController', ['$scope', 'facet', '$location', 'indexService', 'searchService', FacetValueModalController])
    .factory('Query', ['arachneSettings', Query])
    .controller('SearchController', ['$rootScope', '$scope', 'searchService', 'categoryService', '$filter',
        'arachneSettings', '$location', 'Catalog', 'CatalogEntry', 'messageService', '$uibModal', '$http', 'Entity',
        'authService', '$timeout', 'searchScope', SearchController])
    .factory('searchService', ['$location', 'Entity', 'Query', '$q', 'searchScope', searchService])
    .directive('arSearchNavOrderMenu', () => ({ template: require('./ar-search-nav-order-menu.html') }))
    .directive('arSearchNavPagination', () => ({ template: require('./ar-search-nav-pagination.html') }))
    .directive('arSearchNavToolbar', () => ({ template: require('./ar-search-nav-toolbar.html') }))
    .filter('cellsFromEntities', ['arachneSettings', 'categoryService', cellsFromEntities])
;

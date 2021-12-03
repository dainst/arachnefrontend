import angular from 'angular';
import 'angular-ui-bootstrap';
import 'angular-ui-bootstrap/dist/ui-bootstrap-tpls';
import '@uirouter/angularjs';
import 'angular-sanitize';
import 'angular-resource';
import 'angular-cookies';
//import 'showdown';
//import 'ng-showdown';
//import 'ng-table';
import 'angulartics';
import 'angulartics-piwik';
import 'angular-ui-tree';
import 'oclazyload';

import transl8_en from './_transl8.en.js';
import transl8_de from './_transl8.de.js';

import 'idai-components';
import '../partials/navbar-menu.html';
import '../lib/relative-paths-in-partial.js';

require.context('../con10t/frontimages', false, /^\.\/.*\.(png|jpg|gif|svg)$/);
require.context('../img/', true, /^\.\/.*\.(png|jpg|gif|svg)$/);

import '../con10t/search-scopes.json';
import '../con10t/content.json';
import '../con10t/front.json';
import '../info/content.json';

import './_modules.js';
import './facets/ar-active-facets.directive.js';
import './facets/index.html';
import './facets/index.controller.js';
import './facets/ar-facet-browser.html';
import './facets/ar-facet-browser.directive.js';
import './facets/index.service.js';
import './facets/ar-active-facets.html';
import './markdown/ar-markdown-text-editor.html';
import './markdown/add-markdown-link.html';
import './markdown/add-markdown-link.controller.js';
import './markdown/ar-markdown-text-editor.directive.js';
import './utils/filters/error-message.filter.js';
import './utils/filters/range.filter.js';
import './utils/filters/base64.filter.js';
import './utils/filters/nl2br.filter.js';
import './utils/filters/entity-count-in-facet.filter.js';
import './utils/filters/decapitalize.filter.js';
import './utils/filters/tsvData.filter.js';
import './utils/filters/escape-slashes.filter.js';
import './utils/filters/singular.filter.js';
import './utils/filters/md5.filter.js';
import './utils/filters/strip-coords.filter.js';
import './utils/con10t-show-if.directive.js';
import './utils/con10t-media-tree.html';
import './utils/error-modal.html';
import './utils/con10t-tree.directive.js';
import './utils/autofillfix.directive.js';
import './utils/focus-me.directive.js';
import './utils/convert-to-bool.directive.js';
import './utils/con10t-show-if.html';
import './utils/tiny-footer.directive.js';
import './utils/con10t-tree.html';
import './utils/con10t-include.directive.js';
import './utils/con10t-include.html';
import './utils/news.service.js';
import './utils/con10t-media-tree.directive.js';
import './scope/ar-search-scope.directive.js';
import './scope/ar-scoped.directive.js';
import './scope/ar-search-scope.html';
import './scope/search-scope.service.js';
import './search/search.service.js';
import './search/ar-search-nav-pagination.inc.html';
import './search/ar-search-nav.directive.js';
import './search/con10t-search-catalog.directive.js';
import './search/con10t-search-query.directive.js';
import './search/con10t-search.html';
import './search/facet-value-modal.controller.js';
import './search/ar-search-nav-order-menu.inc.html';
import './search/ar-search-nav.html';
import './search/search.html';
import './search/con10t-search.directive.js';
import './search/search.controller.js';
import './search/facet-value-modal.html';
import './search/ar-search-nav-toolbar.inc.html';
import './search/query.prototype.js';
import './visualizations/con10t-time-line-chart.directive.js';
import './visualizations/con10t-time-line-chart.html';
import './visualizations/con10t-network.directive.js';
import './visualizations/con10t-network-map-popup.html';
//import './visualizations/con10t-table.html';
import './visualizations/con10t-network-chord.html';
//import './visualizations/con10t-table.directive.js';
import './visualizations/con10t-network-map.html';
import './visualizations/con10t-paginated-item-list.directive.js';
import './visualizations/con10t-network-chord.directive.js';
import './visualizations/con10t-network-map-popup.directive.js';
import './visualizations/con10t-paginated-item-list.html';
import './visualizations/con10t-network.html';
import './visualizations/con10t-network-map.directive.js';
import './map/ar-map-nav.html';
import './map/con10t-map-menu-legend.html';
import './map/con10t-map-menu-search-field.html';
import './map/map.html';
import './map/con10t-map-menu-search-info.html';
import './map/con10t-map-overlays.html';
import './map/con10t-map-menu-overlays.directive.js';
import './map/map.service.js';
import './map/con10t-map-menu-baselayer.html';
import './map/con10t-map-menu-search-info.directive.js';
import './map/ar-map-nav.directive.js';
import './map/places.service.js';
import './map/con10t-map-menu-translocations.html';
import './map/heatmap-painter.js';
import './map/map-link-modal.html';
import './map/map-menu.controller.js';
import './map/con10t-map.directive.js';
import './map/con10t-map-menu-overlays.html';
import './map/con10t-map-menu-facet-search.directive.js';
import './map/con10t-map-menu-legend.directive.js';
import './map/place.prototype.js';
import './map/con10t-map-menu-facet-search.html';
import './map/ar-entity-map.directive.js';
import './map/ar-map-marker-popup.directive.js';
import './map/con10t-map-overlays.directive.js';
import './map/con10t-map-menu-translocations.directive.js';
import './map/ar-map-marker-popup.html';
import './map/con10t-map-menu-search-field.directive.js';
import './map/con10t-map-menu-baselayer.directive.js';
import './map/places-painter.js';
import './users/contact.service.js';
import './users/pwd-reset.controller.js';
import './users/edit-user.controller.js';
import './users/register.controller.js';
import './users/contact.html';
import './users/edit-user.html';
import './users/pwd-activation.controller.js';
import './users/pwd-reset.html';
import './users/register.html';
import './users/login-form.controller.js';
import './users/login.html';
import './users/pwd-change.resource.js';
import './users/pwd-reset.resource.js';
import './users/pwd-activation.html';
import './users/pwd-change.controller.js';
import './users/login-form.html';
import './users/auth.service.js';
import './users/pwd-change.html';
import './users/pwd-activation.resource.js';
import './users/contact.controller.js';
import './users/login.controller.js';
import './menu.controller.js';
import './pages/dataexport.controller.js';
import './pages/con10t-toc.directive.js';
import './pages/welcome-page.html';
import './pages/dataimport.controller.js';
import './pages/404.html';
import './pages/welcome-page.controller.js';
import './pages/dataimport.html';
import './pages/projects.controller.js';
import './pages/static.html';
import './pages/con10t-page.directive.js';
import './pages/dataexport.html';
import './pages/con10t-toc.html';
import './pages/static-content.controller.js';

import '../scss/app.scss';

import Catalog from './catalog/catalog.resource.js';
import CatalogEntry from './catalog/catalog-entry.resource.js';
import categoryService from './category/category.service.js';
import Entity from './entity/entity.resource.js';

const lazyLoad = (importPromise) => ($transition$) => {
    const $ocLazyLoad = $transition$.injector().get('$ocLazyLoad');
    return importPromise.then(mod => $ocLazyLoad.load(mod.default));
}

angular.module('arachne', [
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'ui.router',
    'oc.lazyLoad',
    'ngSanitize',
    'ngResource',
    'ngCookies',
    //'ng-showdown',
    //'ngTable',
    'angulartics',
    'angulartics.piwik',
    'relativePathsInPartial',
    'ui.tree',
    'idai.templates',
    'idai.components',
    //'arachne.js-templates',
    //'arachne.partials-templates',
    'arachne.filters',
    'arachne.resources',
    'arachne.services',
    'arachne.directives',
    'arachne.controllers',
    'arachne.widgets.directives',
    'arachne.widgets.map',
    'arachne.visualizations.directives'
])
.factory('Catalog', ['$resource', 'arachneSettings', Catalog])
.factory('CatalogEntry', ['$resource', 'arachneSettings', CatalogEntry])
.factory('categoryService', ['$filter', '$q', 'transl8', categoryService])
.factory('Entity', ['$resource', 'arachneSettings', '$q', Entity])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$compileProvider', '$resourceProvider', '$qProvider', '$httpProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider, $resourceProvider, $qProvider, $httpProvider) {

        // eliminate "Possibly unhandled rejection" errors with Angular 1.5.9
        $qProvider.errorOnUnhandledRejections(false);

        $locationProvider.html5Mode(true);

        //$qProvider.errorOnUnhandledRejections(false);

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|blob):/);

        $resourceProvider.defaults.cancellable = true;

        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/404');

        $httpProvider.useApplyAsync(true);

        var title = 'iDAI.objects / Arachne';


        var loadingPromises = {
            'getSearchScopes': ['searchScope', function (searchScope) {
                return searchScope.loadingPromise;
            }]
        };

        /**
         * we want to realize scope-prefixed urls like project/whatever/search as well as /search
         * and don't want to define all of them double.
         * since both shall lead to search, not to project in the first case, they are not children in the
         * sense of ui-router. Also ui-router does not support optional parameters in the urls yet,
         * and the regex-support in the urls is to limited to realize it like this.
         * that's why we use a little nice function for that
         */


        var states = {
            '404':				{ url: '/404', template: require('./pages/404.html'), data: { pageTitle: 'Arachne | 404' }},
            'welcome':			{ url: '/', template: require('./pages/welcome-page.html'), data: { pageTitle: title }},
            'catalogs.**':		{ url: '/catalogs', lazyLoad: lazyLoad(import('./catalog/catalog.module.js')), data: { pageTitle: title }},
            'catalog.**':		{ url: '/catalog', lazyLoad: lazyLoad(import('./catalog/catalog.module.js')), data: { pageTitle: title }},
            'catalog.entry':	{ url: '/:entryId?view', template: require('./catalog/catalog.html'), data: { pageTitle: title }},
            'books.**':			{ url: '/books', lazyLoad: lazyLoad(import('./entity/entity.module.js')), reloadOnSearch: false, data: { pageTitle: title }},
            'entity.**':		{ url: '/entity', lazyLoad: lazyLoad(import('./entity/entity.module.js')), reloadOnSearch: false, data: { pageTitle: title }},
            'search':			{ url: '/search?q&fq&view&sort&offset&limit&desc&bbox&ghprec&group', template: require('./search/search.html'), data: { pageTitle: title }},
            'categories.**':	{ url: '/categories', lazyLoad: lazyLoad(import('./category/category.module.js')), data: { pageTitle: title }},
            'category.**':		{ url: '/category', lazyLoad: lazyLoad(import('./category/category.module.js')), data: { pageTitle: title }},

            'map': {
                url: '/map?q&fq&view&sort&offset&limit&desc&bbox&ghprec',
                template: require('./map/map.html'),
                data: {
                    pageTitle: title,
                    searchPage: 'map'
                }
            },

            // 'gridmap':			{ url: '/gridmap', template: require('./map/gridmap.html'), data: { pageTitle: title }},
            '3d.**':			{ url: '/3d', lazyLoad: lazyLoad(import('./3d/3d.module.js')), data: { pageTitle: title }},
            'svg.**':			{ url: '/svg', lazyLoad: lazyLoad(import('./svg/svg.module.js')), data: { pageTitle: title }},
            'register':			{ url: '/register', template: require('./users/register.html'), data: { pageTitle: title }},
            'editUser':			{ url: '/editUser', template: require('./users/edit-user.html'), data: { pageTitle: title }},
            'contact':			{ url: '/contact', template: require('./users/contact.html'), data: { pageTitle: title }},
            'dataimport':		{ url: '/admin/dataimport', template: require('./pages/dataimport.html'), data: { pageTitle: title }},
            'dataexport':		{ url: '/admin/dataexport', template: require('./pages/dataexport.html'), data: { pageTitle: title }},
            'pwdreset':			{ url: '/pwdreset', template: require('./users/pwd-reset.html'), data: { pageTitle: title }},
            'pwdchange':		{ url: '/pwdchange', template: require('./users/pwd-change.html'), data: { pageTitle: title }},
            'userActivation':	{ url: '/user/activation/:token', template: require('./users/pwd-activation.html'), data: { pageTitle: title }},
            'project':			{ url: '/project/:title', template: require('./pages/static.html'), data: { pageTitle: title}},
            'index':			{ url: '/index?c&fq&fv&group', template: require('./facets/index.html'), reloadOnSearch: true, data: { pageTitle: title }},
            'info':				{ url: '/info/:title?id', template: require('./pages/static.html'), data: { pageTitle: title }}, // Named it info, not static, to sound not too technical.
            'login':			{ url: '/login?redirectTo', template: require('./users/login.html'), data: { pageTitle: title }}

        };

        var scoped = {'project': ['search', 'map', 'entity.**']};

        function registerState(state, name) {
            $stateProvider.state(name, angular.copy(state));
            angular.forEach(scoped[name] || [], function(child) {
                var newState = angular.copy(states[child]);
                newState.url = state.url + newState.url;
                newState.resolve = loadingPromises;
                newState.data.scoped = true;
                registerState(newState, name + '-' + child);
            });
        }

        angular.forEach(states, registerState);

    }
])
/**
 * Change <title> after page change
 */
.run(['$transitions', 'searchScope', '$rootScope', function($transitions, searchScope, $rootScope) {

    /*
    $transitions.onError({ }, function(trans) {
        console.log(trans.error())
        console.log(trans._ignoredReason())
        console.log(trans._options)
        console.log('pending:', trans.router.globals.transition)
        console.log('tc:', trans.treeChanges())
    });
    */
    $transitions.onSuccess({}, function(trans) {

        var toState = trans.to().$$state();
        var toParams = trans.params();

        document.title = (typeof toParams.title !== "undefined") ? searchScope.getScopeTitle(toParams.title) + ' |\u00A0' : '';
        document.title += toState.data?.pageTitle || '';

        searchScope.refresh(); // refresh scopeObject for navbarSearch
    });


}])
.constant('transl8map', { en: transl8_en, de: transl8_de })
.constant('arachneSettings', {
    arachneUrl: 'https://arachne.dainst.org',
    dataserviceUri: "//" + document.location.host + "/data",
    limit: 50,
    facetLimit: 20,
    openFacets : ["facet_kategorie", "facet_image", "facet_bestandsname", "facet_subkategoriebestand"], // order is important for sorting of default facets
    sortableFields : ["entityId", "title", "subtitle"],
    maxSearchSizeForCatalog: 10000,
    batchSizeForCatalog: 100,
})
.constant('componentsSettings', {
    transl8Uri: 'https://arachne.dainst.org/transl8/translation/jsonp?application=arachne4_frontend&application=shared&lang={LANG}',
    searchUri: 'https://arachne.dainst.org/data/suggest?q=',
    dataProtectionPolicyUri: 'http://www.dainst.org/datenschutz',
    mailTo: 'idai.objects@dainst.org',
});

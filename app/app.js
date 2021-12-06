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
import '../lib/relative-paths-in-partial.js';

require.context('../con10t/frontimages', false, /^\.\/.*\.(png|jpg|gif|svg)$/);
require.context('../img/', true, /^\.\/.*\.(png|jpg|gif|svg)$/);

import '../con10t/search-scopes.json';
import '../con10t/content.json';
import '../con10t/front.json';
import '../info/content.json';

import './_modules.js';
import './facets/ar-active-facets.directive.js';
import './facets/index.controller.js';
import './facets/ar-facet-browser.directive.js';
import './facets/index.service.js';
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
import './utils/con10t-tree.directive.js';
import './utils/autofillfix.directive.js';
import './utils/focus-me.directive.js';
import './utils/convert-to-bool.directive.js';
import './utils/tiny-footer.directive.js';
import './utils/con10t-include.directive.js';
import './utils/news.service.js';
import './utils/con10t-media-tree.directive.js';
import './visualizations/con10t-time-line-chart.directive.js';
import './visualizations/con10t-network.directive.js';
////import './visualizations/con10t-table.directive.js';
import './visualizations/con10t-paginated-item-list.directive.js';
import './visualizations/con10t-network-chord.directive.js';
import './visualizations/con10t-network-map-popup.directive.js';
import './visualizations/con10t-network-map.directive.js';
import './users/contact.service.js';
import './users/pwd-reset.controller.js';
import './users/edit-user.controller.js';
import './users/register.controller.js';
import './users/pwd-activation.controller.js';
import './users/login-form.controller.js';
import './users/pwd-change.resource.js';
import './users/pwd-reset.resource.js';
import './users/pwd-change.controller.js';
import './users/auth.service.js';
import './users/pwd-activation.resource.js';
import './users/contact.controller.js';
import './users/login.controller.js';
import './menu.controller.js';
import './pages/dataexport.controller.js';
import './pages/con10t-toc.directive.js';
import './pages/dataimport.controller.js';
import './pages/welcome-page.controller.js';
import './pages/projects.controller.js';
import './pages/con10t-page.directive.js';
import './pages/static-content.controller.js';

import '../scss/app.scss';

import Catalog from './catalog/catalog.resource.js';
import CatalogEntry from './catalog/catalog-entry.resource.js';
import categoryService from './category/category.service.js';
import Entity from './entity/entity.resource.js';
import scopeModule from './scope/scope.module.js';

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
    'arachne.visualizations.directives',
    scopeModule.name
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
            'search.**':		{ url: '/search', lazyLoad: lazyLoad(import('./search/search.module.js')), data: { pageTitle: title }},
            'categories.**':	{ url: '/categories', lazyLoad: lazyLoad(import('./category/category.module.js')), data: { pageTitle: title }},
            'category.**':		{ url: '/category', lazyLoad: lazyLoad(import('./category/category.module.js')), data: { pageTitle: title }},
            'map.**':           { url: '/map', lazyLoad: lazyLoad(import('./map/map.module.js')), data: { pageTitle: title, searchPage: 'map' }},
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

        var scoped = {'project': ['search.**', 'map.**', 'entity.**']};

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
.run(['$transitions', 'searchScope', function($transitions, searchScope) {

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

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

import './_transl8.en.js';
import './_transl8.de.js';

import 'idai-components';
import '../lib/relative-paths-in-partial.js';

import './_modules.js';
import './SVG/svg.html';
import './SVG/svg.controller.js';
import './3d/3d-info-modal.html';
import './3d/three-dimensional.controller.js';
import './3d/threedviewer.directive.js';
import './3d/3d.html';
import './facets/ar-active-facets.directive.js';
import './facets/index.html';
import './facets/index.controller.js';
import './facets/ar-facet-browser.html';
import './facets/ar-facet-browser.directive.js';
import './facets/index.service.js';
import './facets/ar-active-facets.html';
import './category/category.controller.js';
import './category/category.html';
import './category/categories.controller.js';
import './category/category.service.js';
import './category/categories.html';
import './entity/entity.controller.js';
import './entity/entity-images.controller.js';
import './entity/cells-from-entities.filter.js';
import './entity/ar-entity-links.directive.js';
import './entity/ar-entity-header.directive.js';
import './entity/ar-entity-links.html';
import './entity/ar-entity-3dmodel.html';
import './entity/ar-schemaorg-jsonld.directive.js';
import './entity/entity-image.html';
import './entity/entity-images.html';
import './entity/ar-schemaorg-jsonld.html';
import './entity/ar-entity-title.directive.js';
import './entity/ar-entity-3dmodel.directive.js';
import './entity/ar-entity-title.html';
import './entity/ar-entity-header.html';
import './entity/ar-entity-sections.directive.js';
import './entity/entity.resource.js';
import './entity/ar-entity-sections.html';
import './entity/entity-image.controller.js';
import './entity/entity.html';
import './entity/con10t-item.directive.js';
import './markdown/ar-markdown-text-editor.html';
import './markdown/add-markdown-link.html';
import './markdown/add-markdown-link.controller.js';
import './markdown/ar-markdown-text-editor.directive.js';
import './catalog/catalog.resource.js';
import './catalog/edit-catalog-entry.controller.js';
import './catalog/catalog-manage-editor.controller.js';
import './catalog/edit-entry.controller.js';
import './catalog/catalog.html';
import './catalog/ar-catalog-occurrences.directive.js';
import './catalog/edit-catalog.controller.js';
import './catalog/catalog-progress.html';
import './catalog/delete-catalog.js';
import './catalog/edit-catalog-help.html';
import './catalog/catalog-manage-editor.html';
import './catalog/catalogs.html';
import './catalog/create-entry-pos.html';
import './catalog/edit-catalog.html';
import './catalog/delete-catalog.html';
import './catalog/con10t-catalog-tree.directive.js';
import './catalog/edit-catalog-help.controller.js';
import './catalog/delete-entries.html';
import './catalog/catalogs.controller.js';
import './catalog/catalog.controller.js';
import './catalog/ar-catalog-occurrences.html';
import './catalog/update-entry.html';
import './catalog/edit-entry.html';
import './catalog/delete-entry.html';
import './catalog/catalog-entry.resource.js';
import './catalog/con10t-catalog-tree.html';
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
import './image/con10t-image.html';
import './image/ar-imageslider.directive.js';
import './image/ar-imageslider.html';
import './image/cells-from-images.filter.js';
import './image/zoomifyimg.directive.js';
import './image/ar-imagegrid-cell.directive.js';
import './image/ar-img.directive.js';
import './image/ar-imagegrid.html';
import './image/con10t-image.directive.js';
import './image/ar-imagegrid.directive.js';
import './image/ar-imagegrid-cell.html';
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
import './export/download.controller.js';
import './export/download-modal.html';
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

angular.module('arachne', [
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'ui.router',
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
            '404':				{ url: '/404', templateUrl: 'app/pages/404.html', data: { pageTitle: 'Arachne | 404' }},
            'welcome':			{ url: '/', templateUrl: 'app/pages/welcome-page.html', data: { pageTitle: title }},
            'catalogs':			{ url: '/catalogs', templateUrl: 'app/catalog/catalogs.html', data: { pageTitle: title }},
            'catalog':			{ url: '/catalog/:id?view', templateUrl: 'app/catalog/catalog.html', data: { pageTitle: title }},
            'catalog.entry':	{ url: '/:entryId?view', templateUrl: 'app/catalog/catalog.html', data: { pageTitle: title }},
            'books':			{ url: '/books/:id', templateUrl: 'app/entity/entity.html', reloadOnSearch: false, data: { pageTitle: title }},
            'booksSuffixed':	{ url: '/books/:id/:suffix?', templateUrl: 'app/entity/entity.html', reloadOnSearch: false, data: { pageTitle: title }},
            'booksSuffixedPage':	{ url: '/books/:id/:suffix/:page?', templateUrl: 'app/entity/entity.html', reloadOnSearch: false, data: { pageTitle: title }}, // Temporary fix for WIT-185, also see Ticket SD-842
            'entity':			{ url: '/entity/:id?/:params?', templateUrl: 'app/entity/entity.html', reloadOnSearch: false, data: { pageTitle: title }},
            'entityImages':		{ url: '/entity/:entityId/images', templateUrl: 'app/entity/entity-images.html', data: { pageTitle: title }},
            'entityImage':		{ url: '/entity/:entityId/image/:imageId', templateUrl: 'app/entity/entity-image.html', data: { pageTitle: title }},
            'search':			{ url: '/search?q&fq&view&sort&offset&limit&desc&bbox&ghprec&group', templateUrl: 'app/search/search.html', data: { pageTitle: title }},
            'categories':		{ url: '/categories', templateUrl: 'app/category/categories.html', data: { pageTitle: title }},
            'category':			{ url: '/category/?c&facet&fv&group', templateUrl: 'app/category/category.html', data: { pageTitle: title }},

            'map': {
                url: '/map?q&fq&view&sort&offset&limit&desc&bbox&ghprec',
                templateUrl: 'app/map/map.html',
                data: {
                    pageTitle: title,
                    searchPage: 'map'
                }
            },

            'gridmap':			{ url: '/gridmap', templateUrl: 'app/map/gridmap.html', data: { pageTitle: title }},
            '3d':				{ url: '/3d', templateUrl: 'app/3d/3d.html', data: { pageTitle: title }},
            'SVG':				{ url: '/SVG', templateUrl: 'app/SVG/svg.html', data: { pageTitle: title }},
            'register':			{ url: '/register', templateUrl: 'app/users/register.html', data: { pageTitle: title }},
            'editUser':			{ url: '/editUser', templateUrl: 'app/users/edit-user.html', data: { pageTitle: title }},
            'contact':			{ url: '/contact', templateUrl: 'app/users/contact.html', data: { pageTitle: title }},
            'dataimport':		{ url: '/admin/dataimport', templateUrl: 'app/pages/dataimport.html', data: { pageTitle: title }},
            'dataexport':		{ url: '/admin/dataexport', templateUrl: 'app/pages/dataexport.html', data: { pageTitle: title }},
            'pwdreset':			{ url: '/pwdreset', templateUrl: 'app/users/pwd-reset.html', data: { pageTitle: title }},
            'pwdchange':		{ url: '/pwdchange', templateUrl: 'app/users/pwd-change.html', data: { pageTitle: title }},
            'userActivation':	{ url: '/user/activation/:token', templateUrl: 'app/users/pwd-activation.html', data: { pageTitle: title }},
            'project':			{ url: '/project/:title', templateUrl: 'app/pages/static.html', data: { pageTitle: title}},
            'index':			{ url: '/index?c&fq&fv&group', templateUrl: 'app/facets/index.html', reloadOnSearch: true, data: { pageTitle: title }},
            'info':				{ url: '/info/:title?id', templateUrl: 'app/pages/static.html', data: { pageTitle: title }}, // Named it info, not static, to sound not too technical.
            'login':			{ url: '/login?redirectTo', templateUrl: 'app/users/login.html', data: { pageTitle: title }}

        };

        var scoped = {'project': ['search', 'map', 'entity', 'entityImage', 'entityImages']};

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
        document.title += toState.data.pageTitle;

           searchScope.refresh(); // refresh scopeObject for navbarSearch
    });


}])
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

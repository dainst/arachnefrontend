import arCatalogOccurrences from './ar-catalog-occurrences.directive.js';
import ManageEditorController from './catalog-manage-editor.controller.js';
import CatalogController from './catalog.controller.js';
import CatalogsController from './catalogs.controller.js';
import con10tCatalogTree from './con10t-catalog-tree.directive.js';
import DeleteCatalogController from './delete-catalog.js';
import EditCatalogEntryController from './edit-catalog-entry.controller.js';
import EditCatalogHelpController from './edit-catalog-help.controller.js';
import EditCatalogController from './edit-catalog.controller.js';
import EditEntryController from './edit-entry.controller.js';
import MarkdownModule from '../markdown/markdown.module.js';

export default angular.module('arachne.catalog', [MarkdownModule.name])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider.state({ name: 'catalogs', url: '/catalogs', template: require('./catalogs.html')});
        $stateProvider.state({ name: 'catalog', url: '/catalog/:id?view', template: require('./catalog.html')});
    }])
    .directive('arCatalogOccurrences', ['arachneSettings', '$http', '$uibModal', 'Catalog', 'CatalogEntry', arCatalogOccurrences])
    .controller('ManageEditorController', ['$scope', '$http', 'arachneSettings', 'messageService', '$uibModalInstance', 'catalog', ManageEditorController])
    .controller('CatalogController', ['$rootScope', '$scope', '$state', '$stateParams', '$uibModal', '$window', '$timeout',
        'Catalog', 'CatalogEntry', 'authService', '$http', 'arachneSettings', 'Entity', '$location', 'messageService', CatalogController])
    .controller('CatalogsController',['$scope', '$uibModal', '$location',
        'authService', 'Entity', 'Catalog', 'CatalogEntry', '$http', 'arachneSettings', 'messageService', CatalogsController])
    .directive('con10tCatalogTree', ['Catalog', 'CatalogEntry', '$filter', con10tCatalogTree])
    .controller('DeleteCatalogController', ['$scope', DeleteCatalogController])
    .controller('EditCatalogEntryController', ['$scope', 'Entity', 'entry', EditCatalogEntryController])
    .controller('EditCatalogHelpController', ['$scope', EditCatalogHelpController])
    .controller('EditCatalogController', ['$scope', 'catalog', EditCatalogController])
    .controller('EditEntryController', ['$scope', EditEntryController])
;

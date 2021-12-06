import arEntity3dmodel from './ar-entity-3dmodel.directive.js';
import arEntityHeader from './ar-entity-header.directive.js';
import arEntityLinks from './ar-entity-links.directive.js';
import arEntitySections from './ar-entity-sections.directive.js';
import arEntityTitle from './ar-entity-title.directive.js';
import arSchemaorgJsonld from './ar-schemaorg-jsonld.directive.js';
import con10tItem from './con10t-item.directive.js';
import EntityImageController from './entity-image.controller.js';
import EntityImagesController from './entity-images.controller.js';
import EntityController from './entity.controller.js';

export default angular.module('arachne.entity', ['arachne.scope'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider.state({ name: 'entity', url: '/entity/:id?/:params?', template: require('./entity.html') });
        $stateProvider.state({ name: 'entityImages', url: '/entity/:entityId/images', template: require('./entity-images.html') });
        $stateProvider.state({ name: 'entityImage', url: '/entity/:entityId/image/:imageId', template: require('./entity-image.html') });
        $stateProvider.state({ name: 'books', url: '/books/:id', template: require('./entity.html') });
        $stateProvider.state({ name: 'booksSuffixed', url: '/books/:id/:suffix?', template: require('./entity.html') });
        $stateProvider.state({ name: 'booksSuffixedPage', url: '/books/:id/:suffix/:page?', template: require('./entity.html') });   
    }])
    .directive('arEntity3dmodel', ['arachneSettings', arEntity3dmodel])
    .directive('arEntityHeader', arEntityHeader)
    .directive('arEntityLinks', arEntityLinks)
    .directive('arEntitySections', arEntitySections)
    .directive('arEntityTitle', arEntityTitle)
    .directive('arSchemaorgJsonld', arSchemaorgJsonld)
    .directive('con10tItem', con10tItem)
    .controller('EntityImageController', ['$stateParams', '$scope', 'Entity', 'authService', 'searchService', '$rootScope', 'messageService', EntityImageController])
    .controller('EntityImagesController', ['$stateParams', '$scope', 'Entity', '$filter', 'searchService', '$rootScope', 'messageService', EntityImagesController])
    .controller('EntityController', ['$rootScope', '$stateParams', 'searchService', '$scope', 'Entity',
        '$location', 'authService', 'categoryService', 'Query',
        'messageService', 'searchScope', EntityController])
;

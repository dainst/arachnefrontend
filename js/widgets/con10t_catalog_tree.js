'use strict';

/* Widget directives */
angular.module('arachne.widgets.directives')

/**
 * @author: Sebastian Cuy
 * @author: Thomas Kleinke
 */
.directive('con10tCatalogTree', ['Catalog', 'CatalogEntry', '$filter',
	function(Catalog, CatalogEntry, $filter) {

		var limit = 20;

		return {
			restrict: 'E',
			scope: {
				catalogId: '@',
				heading: '='
			},
			templateUrl: 'partials/widgets/con10t-catalog-tree.html',
			link: function(scope) {

                scope.catalog = { root: { loading: true } };
				Catalog.get({id:scope.catalogId, limit: limit}, function(catalog) {
                    scope.catalog = catalog;
                });
				scope.isShown = {};
				
				scope.escapePath = function(path){
					return $filter('escapeSlashes')(path)
				};
				
				scope.toggleCollapse = function(node){
				    if (node.totalChildren) {
						scope.isShown[node.id] = !scope.isShown[node.id];
				    	if (!node.hasOwnProperty('children')) {
                            node.loading = true;
				    		CatalogEntry.get({id:node.id, limit: limit}, function(newNode) {
				    			node.children = newNode.children;
                                node.loading = false;
				    		});
				    	}
				    }
				};
				
				scope.checkIfShown = function(node){
					return scope.isShown[node.id]; // at first load -> undefined, so it gets hidden but: ugly?
				};

				scope.loadMore = function(node) {
                    node.loading = true;
                    CatalogEntry.get({id:node.id, limit: limit, offset: node.children.length}, function(newNode) {
                        node.children = node.children.concat(newNode.children);
                        node.loading = false;
                    });
				};

			}
		};
	}
]);
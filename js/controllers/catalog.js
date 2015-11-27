'use strict';

angular.module('arachne.controllers')

/**
 * Handles the layout for viewing a catalog.
 *
 * @author: Sebastian Cuy
 */
 .controller('CatalogController', ['$scope','$stateParams',
 	function($scope, $stateParams) {
 		$scope.id = $stateParams.id;
 	}
 ])

/**
 * Handles the layout for editing the catalog structure.
 *
 * @author: Sebastian Cuy, Oliver Bensch
 */
.controller('CatalogsController',['$scope', '$modal', 'authService', 'Entity', 'Catalog', 'CatalogEntry', '$http', 'arachneSettings',
	function ($scope, $modal, authService, Entity, Catalog, CatalogEntry, $http, arachneSettings) {

		$scope.catalogs = [];
		$scope.user = authService.getUser();

		$http.get(arachneSettings.dataserviceUri + '/userinfo/' + $scope.user.username).success(function(user) {
			$scope.user = user;
		});

		$scope.loading = 0;

		$scope.treeOptions = {
			dropped: function(event) {
				updateActiveCatalog();
			}
		}

		$scope.refreshCatalogs = function(){
			$scope.loading++;
			Catalog.query({full:false}, function(result) {
				$scope.loading--;
				$scope.catalogs = result;
				if (!$scope.activeCatalog) {
					$scope.setActiveCatalog($scope.catalogs[0]);
				}
			});
		}

		$scope.refreshCatalogs();

		$scope.setActiveCatalog = function(catalog) {
			createChildrenArray(catalog.root);
			$scope.activeCatalog = catalog;
		}

		$scope.addChild = function(entry) {
			if (!entry.children) {
				entry.children = [];
			}
			var editEntryModal = $modal.open({
				templateUrl: 'partials/Modals/editEntry.html'
			});
			editEntryModal.close = function(newEntry) {
				entry.children.push(newEntry);
				$http.post(arachneSettings.dataserviceUri + "/catalogentry/" + entry.id +"/add", newEntry);
				editEntryModal.dismiss();
			}			
		}

		$scope.toggle = function(scope) {
			scope.toggle();
		}

		$scope.remove = function(scope) {
			var deleteModal = $modal.open({
				templateUrl: 'partials/Modals/delete.html'
			});
			deleteModal.close = function() {
				scope.remove();
				updateActiveCatalog();
				deleteModal.dismiss();
			}
		}

		$scope.editEntry = function(entry) {
			var editEntryModal = $modal.open({
				templateUrl: 'partials/Modals/editEntry.html',
				controller: 'EditCatalogEntryController',
				resolve: { entry: function() { return entry } }
			});
			editEntryModal.close = function(newEntry) {
				entry = newEntry;
				updateActiveCatalog();
				editEntryModal.dismiss();
			}
		}

		$scope.createCatalog = function() {
			var catalogBuffer = {
				author: $scope.user.username
			};
			if($scope.user.firstname && $scope.user.lastname) {
				catalogBuffer.author = $scope.user.firstname + " " + $scope.user.lastname;
			}
			var editCatalogModal = $modal.open({
				templateUrl: 'partials/Modals/editCatalog.html',
				controller: 'EditCatalogController',
				resolve: { catalog: function() { return catalogBuffer } }
			});
			editCatalogModal.close = function(newCatalog) {
				newCatalog.public = false;
				Catalog.save({}, newCatalog, function(result) {
					$scope.catalogs.push(result);
					$scope.activeCatalog = result;
				});
				editCatalogModal.dismiss();
			}
		}

		$scope.editCatalog = function() {
			var editCatalogModal = $modal.open({
				templateUrl: 'partials/Modals/editCatalog.html',
				controller: 'EditCatalogController',
				resolve: { catalog: function() { return $scope.activeCatalog } }
			});
			editCatalogModal.close = function(newCatalog) {
				$scope.activeCatalog = newCatalog;
				Catalog.update({id: $scope.activeCatalog.id}, newCatalog);
				editCatalogModal.dismiss();
			}
		}

		$scope.removeCatalog = function() {
			var deleteModal = $modal.open({
				templateUrl: 'partials/Modals/delete.html'
			});
			deleteModal.close = function() {
				var index = $scope.catalogs.indexOf($scope.activeCatalog);
				$scope.catalogs.splice(index, 1);
				Catalog.remove({id: $scope.activeCatalog.id});
				$scope.activeCatalog = $scope.catalogs[0];
				deleteModal.dismiss();
			}
		}

		$scope.expandAll = function() {
			getRootNodesScope().expandAll();
		}

		$scope.collapseAll = function(entry) {
			getRootNodesScope().collapseAll();
		}

		function updateActiveCatalog() {
			for(var i = $scope.offset; i<=($scope.offset+$scope.pageSize); i++){
				$scope.originalCatalog.root.children[i] = $scope.activeCatalog.root.children[i-$scope.offset];
			}
			Catalog.update({ id: $scope.activeCatalog.id }, $scope.activeCatalog);
		}

		function getRootNodesScope() {
			return angular.element(document.getElementById("tree-root")).scope();
		}

		// recursively creates empty children arrays
		// needed to enable dragging to entries without children
		// see https://github.com/angular-ui-tree/angular-ui-tree/issues/203
		function createChildrenArray(entry) {
			if (entry.children) {
				entry.children.forEach(function(child) {
					if (!child.hasChildren) child.children = [];
					else createChildrenArray(child);
				});
			}
		}

	}
])
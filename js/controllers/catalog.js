'use strict';

angular.module('arachne.controllers')

/**
 * Handles the layout for editing the catalog structure.
 *
 * @author: Sebastian Cuy, Oliver Bensch
 */
.controller('CatalogController',['$scope', '$modal', 'authService', 'Entity', 'Catalog', 'CatalogEntry',
	function ($scope, $modal, authService, Entity, Catalog, CatalogEntry) {

		$scope.catalogs = [];
		$scope.user = authService.getUser();

		$scope.treeOptions = {
			dropped: function(event) {
				updateActiveCatalog();
			}
		}

		$scope.refreshCatalogs = function(){
			Catalog.query(function(result) {
				$scope.catalogs = result;
				if (!$scope.activeCatalog) {
					$scope.activeCatalog = $scope.catalogs[0];
				}
			});
		}

		$scope.refreshCatalogs();

		$scope.setActiveCatalog = function(catalog) {
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
				entry.expanded = true;
				updateActiveCatalog();
				editEntryModal.dismiss();
			}			
		}

		$scope.removeEntry = function(entry, parent) {
			if (parent == undefined) {
				parent = $scope.activeCatalog.root;
			}
			var deleteModal = $modal.open({
				templateUrl: 'partials/Modals/delete.html'
			});
			deleteModal.close = function() {
				var index = parent.children.indexOf(entry);
				parent.children.splice(index, 1);
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

		$scope.expandAll = function(entry) {
			entry.expanded = true;
			if (entry.children || entry.children.length > 0) {
				for (var i = 0; i < entry.children.length; i++) {
					$scope.expandAll(entry.children[i]);
				}
			}
		}

		$scope.collapseAll = function(entry) {
			entry.expanded = false;
			if (entry.children || entry.children.length > 0) {
				for (var i = 0; i < entry.children.length; i++) {
					$scope.collapseAll(entry.children[i]);
				}
			}
		}

		function updateActiveCatalog() {
			Catalog.update({ id: $scope.activeCatalog.id }, $scope.activeCatalog);
		}

	}
])
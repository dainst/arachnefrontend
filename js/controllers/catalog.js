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
 * @author: Sebastian Cuy, Oliver Bensch, Thomas Kleinke
 */
.controller('CatalogsController',['$scope', '$uibModal', 'authService', 'Entity', 'Catalog', 'CatalogEntry', '$http', 'arachneSettings',
	function ($scope, $uibModal, authService, Entity, Catalog, CatalogEntry, $http, arachneSettings) {

		$scope.catalogs = [];
		$scope.entryMap = {};
		$scope.user = authService.getUser();
		$scope.childrenLimit = 3;

		$http.get(arachneSettings.dataserviceUri + '/userinfo/' + $scope.user.username).success(function(user) {
			$scope.user = user;
		});

		$scope.loading = 0;

		$scope.treeOptions = {
			dropped: function(event) {
				var movedEntry = $scope.entryMap[event.source.nodeScope.$modelValue.id];
				if (event.dest.nodesScope.$parent.$modelValue) {
					movedEntry.parentId = event.dest.nodesScope.$parent.$modelValue.id;
				} else {
					movedEntry.parentId = $scope.activeCatalog.root.id;
				}
				movedEntry.indexParent = getIndexParent(movedEntry);
				CatalogEntry.update({ id: movedEntry.id }, movedEntry);
			}
		};

		$scope.refreshCatalogs = function(){
			$scope.loading++;
			Catalog.query({ full: false, limit: 0 }, function(result) {
				$scope.loading--;
				$scope.catalogs = result;
				if (!$scope.activeCatalog) {
					$scope.setActiveCatalog($scope.catalogs[0]);
				}
			});
		};

		$scope.refreshCatalogs();

		$scope.setActiveCatalog = function(catalog) {
			initialize(catalog.root);
			if (catalog.root.children.length == 0 && catalog.root.totalChildren > 0) {
				$scope.loadChildren(catalog.root);
			}
			$scope.activeCatalog = catalog;
		};

		$scope.addChild = function(scope, entry) {
			if (!entry.children) entry.children = [];
			var editEntryModal = $uibModal.open({
				templateUrl: 'partials/Modals/editEntry.html'
			});
			editEntryModal.close = function(newEntry) {
				newEntry.parentId = entry.id;
				newEntry.indexParent = entry.children.length;
				CatalogEntry.save({}, newEntry, function(result) {
					entry.children.push(result);
					entry.totalChildren += 1;
					initialize(result);
					if (scope && scope.collapsed) {
						$scope.toggleNode(scope, entry);
					}
				});
				editEntryModal.dismiss();
			}
		};

		$scope.toggleNode = function(scope, entry) {
			if (entry.totalChildren > 0 && (!entry.children || entry.children.length == 0)) {
				CatalogEntry.get({ id: entry.id, limit: $scope.childrenLimit, offset: 0 }, function(result) {
					entry.children = result.children;
					for (var i in entry.children) initialize(entry.children[i]);
					scope.toggle();
				});
			} else scope.toggle();
		};

		$scope.loadChildren = function(entry) {
			CatalogEntry.get({ id: entry.id, limit: $scope.childrenLimit, offset: entry.children.length }, function(result) {
				entry.children = entry.children.concat(result.children);
				for (var i in entry.children) initialize(entry.children[i]);
			});
		};

		$scope.removeEntry = function(scope, entry) {
			var deleteModal = $uibModal.open({
				templateUrl: 'partials/Modals/deleteEntry.html'
			});
			deleteModal.close = function() {
				scope.remove();
				$scope.entryMap[entry.parentId].totalChildren -= 1;
				CatalogEntry.remove({ id: entry.id });
				deleteModal.dismiss();
			}
		};

		$scope.editEntry = function(entry) {
			var editEntryModal = $uibModal.open({
				templateUrl: 'partials/Modals/editEntry.html',
				controller: 'EditCatalogEntryController',
				resolve: { entry: function() { return entry } }
			});
			editEntryModal.close = function(editedEntry) {
				entry = editedEntry;
				entry.indexParent = getIndexParent(entry);
				CatalogEntry.update({ id: entry.id }, entry);
				editEntryModal.dismiss();
			}
		};

		$scope.createCatalog = function() {
			var catalogBuffer = {
				author: $scope.user.username
			};
			if ($scope.user.firstname && $scope.user.lastname) {
				catalogBuffer.author = $scope.user.firstname + " " + $scope.user.lastname;
			}
			var editCatalogModal = $uibModal.open({
				templateUrl: 'partials/Modals/editCatalog.html',
				controller: 'EditCatalogController',
				resolve: { catalog: function() { return catalogBuffer }, edit: false }
			});
			editCatalogModal.close = function(newCatalog) {
				newCatalog.public = false;
				Catalog.save({}, newCatalog, function(result) {
					$scope.catalogs.push(result);
					$scope.activeCatalog = result;
				});
				editCatalogModal.dismiss();
			}
		};

		$scope.editCatalog = function() {
			var editCatalogModal = $uibModal.open({
				templateUrl: 'partials/Modals/editCatalog.html',
				controller: 'EditCatalogController',
				resolve: { catalog: function() { return $scope.activeCatalog }, edit: true }
			});
			editCatalogModal.close = function(result) {
				$scope.activeCatalog = result;
				Catalog.update({id: $scope.activeCatalog.id}, result);
				editCatalogModal.dismiss();
			}
		};

		$scope.removeCatalog = function() {
			var deleteModal = $uibModal.open({
				templateUrl: 'partials/Modals/deleteCatalog.html'
			});
			deleteModal.close = function() {
				var index = $scope.catalogs.indexOf($scope.activeCatalog);
				$scope.catalogs.splice(index, 1);
				Catalog.remove({id: $scope.activeCatalog.id});
				$scope.activeCatalog = $scope.catalogs[0];
				deleteModal.dismiss();
			}
		};

		function initialize(entry) {
			$scope.entryMap[entry.id] = entry;

			// needed to enable dragging to entries without children
			// see https://github.com/angular-ui-tree/angular-ui-tree/issues/203
			if (!entry.children) entry.children = [];
		}

		function getIndexParent(entry) {
			var parent = $scope.entryMap[entry.parentId];
			return parent.children.indexOf(entry);
		}

	}
])
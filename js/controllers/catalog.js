'use strict';

angular.module('arachne.controllers')

/**
 * Handles the layout for editing the catalog structure.
 *
 * @author: Sebastian Cuy, Oliver Bensch
 */
.controller('CatalogController',['$scope', '$modal', 'authService', 'Entity', 'Catalog', 'CatalogEntry', '$http', 'arachneSettings',
	function ($scope, $modal, authService, Entity, Catalog, CatalogEntry, $http, arachneSettings) {

		$scope.catalogs = [];
		$scope.user = authService.getUser();

		//Pagination
		$scope.pageBool = false;
		$scope.curPage = 1;
		$scope.pages = 0;
		$scope.pageSize = 10;
		$scope.offset = 0;
		$scope.originalCatalog = {};

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

		$scope.paging = function(forward){
			var children = [];

			if(forward){
				$scope.offset = $scope.offset+$scope.pageSize; $scope.curPage++;
			}else{
				$scope.offset = $scope.offset-$scope.pageSize; $scope.curPage--;
			}

			for(var i = $scope.offset; i<=($scope.offset+$scope.pageSize); i++){
				if($scope.originalCatalog.root.children[i])
					children[i-$scope.offset] = $scope.originalCatalog.root.children[i];
			}
			$scope.activeCatalog.root.children = children;
		}
		$scope.setActiveCatalog = function(catalog) {
			$scope.refreshCatalogs();
			if(catalog.root.children.length >= $scope.pageSize){
				$scope.curPage = 1;
				$scope.offset = 0;
				$scope.originalCatalog = angular.copy(catalog);
				$scope.activeCatalog = catalog;
				$scope.pageBool = true;
				$scope.pages = Math.ceil(catalog.root.children.length / $scope.pageSize);
				
				var children = [];

				for(var i = $scope.offset; i<=($scope.offset+$scope.pageSize); i++){
					children[i] = catalog.root.children[i];
				}	

				$scope.activeCatalog.root.children = children;
			}else{
				$scope.curPage = 1;
				$scope.pages = 0;
				$scope.pageBool = false;
				$scope.activeCatalog = catalog;
				$scope.offset = 0;
				$scope.originalCatalog = {};
			}
		}

		$scope.getFullCatalog = function(){
			$http.get(arachneSettings.dataserviceUri + "/Catalog/:" + $scope.activeCatalog.id, { params: { full : true }}).success (function(data){
					$scope.setActiveCatalog(data);
				});
		}

		$scope.addChild = function(entry) {
			if (!entry.children) {
				entry.children = [];
			}
			console.log(entry);
			var editEntryModal = $modal.open({
				templateUrl: 'partials/Modals/editEntry.html'
			});
			editEntryModal.close = function(newEntry) {
				entry.children.push(newEntry);
				entry.expanded = true;
				//updateActiveCatalog();
				$http.post(arachneSettings.dataserviceUri + "/catalogentry/" + entry.id +"/add", newEntry)
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
			if(!$scope.pageBool)
				Catalog.update({ id: $scope.activeCatalog.id }, $scope.activeCatalog);
			else{
				for(var i = $scope.offset; i<=($scope.offset+$scope.pageSize); i++){
					$scope.originalCatalog.root.children[i] = $scope.activeCatalog.root.children[i-$scope.offset];
				}
				Catalog.update({ id: $scope.activeCatalog.id }, $scope.originalCatalog);
			}
		}

	}
])
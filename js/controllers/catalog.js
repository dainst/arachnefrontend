'use strict';

angular.module('arachne.controllers')

/**
 * Handles the layout for viewing and editing a catalog.
 *
 * @author: Sebastian Cuy
 */
.controller('CatalogController', ['$rootScope', '$scope', '$state', '$stateParams', '$uibModal', 'Catalog', 'CatalogEntry', 'authService', '$http', 'arachneSettings', 'Entity', '$location',
	function ($rootScope, $scope, $state, $stateParams, $uibModal, Catalog, CatalogEntry, authService, $http, arachneSettings, Entity, $location) {

		$rootScope.hideFooter = true;
		$scope.entryMap = {};
		$scope.catalogId = $stateParams.id;
		if ($stateParams.view == 'map') $scope.map = true;

	    $scope.treeOptions = {
	        beforeDrop: function(event) {
	            var movedEntry = $scope.entryMap[event.source.nodeScope.$modelValue.id];
	            var tempEntry = angular.copy(movedEntry);
	            var newParentId;
	            if (event.dest.nodesScope.$parent.$modelValue) {
	                newParentId = event.dest.nodesScope.$parent.$modelValue.id;
	            } else {
	                newParentId = $scope.catalog.root.id;
	            }
	            tempEntry.parentId = newParentId;
	            tempEntry.indexParent = event.dest.index;
	            if (tempEntry.indexParent != movedEntry.indexParent || tempEntry.parentId != movedEntry.parentId) {
	                var promise = CatalogEntry.update({id: movedEntry.id}, tempEntry).$promise.then(function () {
	                    if (movedEntry.parentId != newParentId) {
	                        $scope.entryMap[movedEntry.parentId].totalChildren -= 1;
	                        $scope.entryMap[newParentId].totalChildren += 1;
	                    }
	                    movedEntry.parentId = newParentId;
	                    movedEntry.indexParent = getIndexParent(movedEntry);
	                }, function () {
	                    message.addMessageForCode('default');
	                });
	                return promise;
	            } else {
	                return true;
	            }
	        }
	    };

	    $scope.addChild = function(scope, entry) {
	        if (!entry.children) entry.children = [];
	        var editEntryModal = $uibModal.open({
	            templateUrl: 'partials/Modals/editEntry.html'
	        });
	        editEntryModal.close = function(newEntry, entity) {
	            if (entity) newEntry.arachneEntityId = entity.entityId;
	            else newEntry.arachneEntityId = null;
	            newEntry.parentId = entry.id;
	            newEntry.indexParent = entry.children.length;
	            CatalogEntry.save({}, newEntry, function(result) {
	                entry.children.push(result);
	                entry.totalChildren += 1;
	                initialize(result);
	                if (scope && scope.collapsed) {
	                    $scope.toggleNode(scope, entry);
	                }
	            }, function() {
	                message.addMessageForCode('default');
	            });
	            editEntryModal.dismiss();
	        }
	    };

	    $scope.toggleNode = function(scope, entry) {
	    	if (entry.totalChildren > 0) {
		        if (!entry.children || entry.children.length == 0) {
		            entry.loading = true;
		            CatalogEntry.get({ id: entry.id, limit: $scope.childrenLimit, offset: 0 }, function(result) {
		                entry.children = result.children;
		                for (var i in entry.children) initialize(entry.children[i]);
		                scope.toggle();
		                entry.loading = undefined;
		            }, function() {
		                message.addMessageForCode('backend_missing');
		            });
		        } else scope.toggle();
		    }
	    };

	    $scope.loadChildren = function(entry) {
	        entry.loading = true;
	        CatalogEntry.get({ id: entry.id, limit: $scope.childrenLimit, offset: entry.children.length }, function(result) {
	            entry.children = entry.children.concat(result.children);
	            for (var i in entry.children) initialize(entry.children[i]);
	            entry.loading = undefined;
	        }, function() {
	            message.addMessageForCode('backend_missing');
	        });
	    };

	    $scope.removeEntry = function(scope, entry) {
	        var deleteModal = $uibModal.open({
	            templateUrl: 'partials/Modals/deleteEntry.html'
	        });
	        deleteModal.close = function() {
	            scope.remove();
	            $scope.entryMap[entry.parentId].totalChildren -= 1;
	            CatalogEntry.remove({ id: entry.id }, function() {
	                deleteModal.dismiss();
	            }, function() {
	                message.addMessageForCode('default');
	            });
	        }
	    };

	    $scope.editEntry = function(entry) {
	        var editableEntry = angular.copy(entry);
	        var editEntryModal = $uibModal.open({
	            templateUrl: 'partials/Modals/editEntry.html',
	            controller: 'EditCatalogEntryController',
	            resolve: { entry: function() { return editableEntry } }
	        });
	        editEntryModal.close = function(editedEntry, entity) {
	            if (entity) editedEntry.arachneEntityId = entity.entityId;
	            else editedEntry.arachneEntityId = null;
	            angular.copy(editedEntry, entry);
	            entry.indexParent = getIndexParent(entry);
	            CatalogEntry.update({ id: entry.id }, entry, function() {
	                editEntryModal.dismiss();
	            }, function() {
	                message.addMessageForCode('default');
	            });
	        }
	    };

	    $scope.editCatalog = function() {
	        var editableCatalog = {
	            author: $scope.catalog.author,
	            public: $scope.catalog.public,
	            root: {
	                label: $scope.catalog.root.label,
	                text: $scope.catalog.root.text
	            }
	        };
	        var editCatalogModal = $uibModal.open({
	            templateUrl: 'partials/Modals/editCatalog.html',
	            controller: 'EditCatalogController',
	            resolve: { catalog: function() { return editableCatalog }, edit: true }
	        });
	        editCatalogModal.close = function(editedCatalog) {
	            $scope.catalog.author = editedCatalog.author;
	            $scope.catalog.public = editedCatalog.public;
	            $scope.catalog.root.label = editedCatalog.root.label;
	            $scope.catalog.root.text = editedCatalog.root.text;

	            Catalog.update({id: $scope.catalog.id}, $scope.catalog, function() {
	                CatalogEntry.update({id: $scope.catalog.root.id}, $scope.catalog.root, function() {
	                    editCatalogModal.dismiss();
	                }, function() {
	                    message.addMessageForCode('default');
	                });
	            }, function() {
	                message.addMessageForCode('default');
	            });

	        }
	    };

	    $scope.removeCatalog = function() {

	        var deleteModal = $uibModal.open({
	            templateUrl: 'partials/Modals/deleteCatalog.html',
                controller: 'DeleteCatalogController',
				scope: $scope
	        });

	        deleteModal.close = function() {

	            Catalog.remove({id: $scope.catalog.id}, function() {
					deleteModal.dismiss();
					$location.url('/catalogs');
				}, function() {
                    message.addMessageForCode('default');
	            });
	        }
	    };

	    $scope.selectEntry = function(entry) {
	    	$state.transitionTo('catalog.entry', { id: $scope.catalog.id, entryId: entry.id }, { notify: false });
	    	showEntry(entry);
	    };

	    $scope.selectEntity = function(entity) {
			CatalogEntry.list({ entityId: entity.entityId }, function(result) {
				for (var i = 0; i < result.length; i++) {
					if (result[i].entry.catalogId == $scope.catalog.id) {
						$scope.selectEntry(result[i].entry);
						break;
					}
				}
			});
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

	    function retrieveCatalog(id) {
	    	Catalog.get({ id: id }, function(result) {
		    	initialize(result.root);
	            if (result.root.children.length == 0 && result.root.totalChildren > 0) {
	                $scope.loadChildren(result.root);
	            } else {
	            	result.root.children.forEach(initialize);
	            }
	            $scope.catalog = result;
	            checkIfEditable();
		    }, function() {
	            message.addMessageForCode('default');
	        });
	    }

	    function showEntry(entry) {
	    	$scope.activeEntry = entry;
	    	if (entry.arachneEntityId) {
	    		Entity.get({id: entry.arachneEntityId}, function(entity) {
	    			$scope.activeEntity = entity;
	    		}, function() {
	    			message.addMessageForCode('default');
	    		});
	    	} else {
	    		$scope.activeEntity = null;
	    	}
	    }

	    function checkIfEditable() {
	    	var user = authService.getUser();
	    	$http.get(arachneSettings.dataserviceUri + '/userinfo/' + $scope.user.username).success(function(user) {
                $scope.editable = ($scope.catalog.userIds.indexOf(user.id) != -1);
            });
	    }

	    retrieveCatalog($stateParams.id);

	    if ($stateParams.entryId) {
	    	CatalogEntry.get({ id: $stateParams.entryId }, function(entry) {
	    		showEntry(entry);
	    	});
	    }

	}
]);
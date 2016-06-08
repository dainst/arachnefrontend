'use strict';

angular.module('arachne.controllers')

/**
 * Handles the layout for editing the catalog structure.
 *
 * @author: Sebastian Cuy, Oliver Bensch, Thomas Kleinke
 */
    .controller('CatalogsController',['$scope', '$uibModal', 'authService', 'Entity', 'Catalog', 'CatalogEntry', '$http', 'arachneSettings', 'message',
        function ($scope, $uibModal, authService, Entity, Catalog, CatalogEntry, $http, arachneSettings, message) {

            $scope.catalogs = [];
            $scope.entryMap = {};
            $scope.user = authService.getUser();
            $scope.childrenLimit = 10;

            $http.get(arachneSettings.dataserviceUri + '/userinfo/' + $scope.user.username).success(function(user) {
                $scope.user = user;
            });

            $scope.loading = 0;

            $scope.treeOptions = {
                beforeDrop: function(event) {
                    var movedEntry = $scope.entryMap[event.source.nodeScope.$modelValue.id];
                    var tempEntry = angular.copy(movedEntry);
                    var newParentId;
                    if (event.dest.nodesScope.$parent.$modelValue) {
                        newParentId = event.dest.nodesScope.$parent.$modelValue.id;
                    } else {
                        newParentId = $scope.activeCatalog.root.id;
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

                if (!catalog) return false;

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
                if (entry.totalChildren > 0 && (!entry.children || entry.children.length == 0)) {
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

            $scope.createCatalog = function() {

                var catalogBuffer = { author: $scope.user.username };

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
                        editCatalogModal.dismiss();
                    }, function() {
                        message.addMessageForCode('default');
                    });
                };
            };

            $scope.editCatalog = function() {
                var editableCatalog = {
                    author: $scope.activeCatalog.author,
                    public: $scope.activeCatalog.public,
                    root: {
                        label: $scope.activeCatalog.root.label,
                        text: $scope.activeCatalog.root.text
                    }
                };
                var editCatalogModal = $uibModal.open({
                    templateUrl: 'partials/Modals/editCatalog.html',
                    controller: 'EditCatalogController',
                    resolve: { catalog: function() { return editableCatalog }, edit: true }
                });
                editCatalogModal.close = function(editedCatalog) {
                    $scope.activeCatalog.author = editedCatalog.author;
                    $scope.activeCatalog.public = editedCatalog.public;
                    $scope.activeCatalog.root.label = editedCatalog.root.label;
                    $scope.activeCatalog.root.text = editedCatalog.root.text;

                    Catalog.update({id: $scope.activeCatalog.id}, $scope.activeCatalog, function() {
                        CatalogEntry.update({id: $scope.activeCatalog.root.id}, $scope.activeCatalog.root, function() {
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
    ]);
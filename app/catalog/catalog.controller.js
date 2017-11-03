'use strict';

angular.module('arachne.controllers')

/**
 * Handles the layout for viewing and editing a catalog.
 *
 * @author: Sebastian Cuy
 * @author: Jan G. Wieners
 */
    .controller('CatalogController', ['$rootScope', '$scope', '$state', '$stateParams', '$uibModal', '$window', '$timeout',
        'Catalog', 'CatalogEntry', 'authService', '$http', 'arachneSettings', 'Entity', '$location', 'messageService',
        function ($rootScope, $scope, $state, $stateParams, $uibModal, $window, $timeout,
                  Catalog, CatalogEntry, authService, $http, arachneSettings, Entity, $location, messages) {

            $rootScope.hideFooter = true;
            $scope.entryMap = {};
            $scope.catalogId = $stateParams.id;
            $scope.childrenLimit = 20;
            $scope.showMoreThumbnailsCount = 20;
            $scope.editable = false;
            $scope.error = false;

            $scope.showThumbnails = false;
            $scope.cells = [];

            $scope.removeItems = false;
            $scope.itemsToRemove = [];

            if ($stateParams.view == 'map') $scope.map = true;

            $scope.treeOptions = {
                beforeDrop: function (event) {
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
                            messages.add('default');
                        });
                        return promise;
                    } else {
                        return true;
                    }
                }
            };

            $scope.addChild = function (scope, entry) {

                if (!entry.children) entry.children = [];
                var editEntryModal = $uibModal.open({
                    templateUrl: 'app/catalog/edit-entry.html'
                });

                editEntryModal.close = function (newEntry, entity) {

                    if (entity) {
                        newEntry.arachneEntityId = entity.entityId;
                    } else {
                        newEntry.arachneEntityId = null;
                    }

                    // Use associated entity title as label if label is not set
                    if (!newEntry.label && entity.title) {
                        newEntry.label = entity.title;
                    }

                    newEntry.parentId = entry.id;
                    newEntry.indexParent = entry.children.length;
                    CatalogEntry.save({}, newEntry, function (result) {
                        entry.children.push(result);
                        entry.totalChildren += 1;
                        initialize(result);
                        if (scope && scope.collapsed) {
                            $scope.toggleNode(scope, entry);
                        }
                    }, function () {
                        messages.add('default');
                    });
                    editEntryModal.dismiss();
                }
            };

            $scope.toggleNode = function (scope, entry) {

                if (entry.totalChildren > 0) {
                    if (!entry.children || entry.children.length == 0) {
                        entry.loading = true;
                        CatalogEntry.get({id: entry.id, limit: $scope.childrenLimit, offset: 0}, function (result) {
                            entry.children = result.children;
                            for (var i in entry.children) initialize(entry.children[i]);
                            scope.toggle();
                            entry.loading = undefined;
                        }, function () {
                            messages.add('backend_missing');
                        });
                    } else scope.toggle();
                }
            };

            $scope.loadChildren = function (entry) {
                entry.loading = true;
                CatalogEntry.get({
                    id: entry.id,
                    limit: $scope.childrenLimit,
                    offset: entry.children.length
                }, function (result) {
                    entry.children = entry.children.concat(result.children);
                    for (var i in entry.children) initialize(entry.children[i]);
                    entry.loading = undefined;
                }, function () {
                    messages.add('backend_missing');
                });
            };

            $scope.removeEntry = function (scope, entry) {
                var deleteModal = $uibModal.open({
                    templateUrl: 'app/catalog/delete-entry.html'
                });
                deleteModal.close = function () {

                    scope.remove();
                    $scope.entryMap[entry.parentId].totalChildren -= 1;
                    CatalogEntry.remove({id: entry.id}, function () {
                        deleteModal.dismiss();
                    }, function () {
                        messages.add('default');
                    });
                }
            };

            $scope.syncEntriesToRemove = function (addEntry, entry, rendererScope) {

                if (addEntry) {
                    $scope.itemsToRemove.push(entry);
                } else {

                    var len = $scope.itemsToRemove.length, i = len, cur;

                    for (i; i--;) {

                        cur = $scope.itemsToRemove[i];

                        if (cur.id === entry.id) {
                            $scope.itemsToRemove.splice(i, 1);
                            return true;
                        }
                    }
                }
            };

            $scope.removeEntries = function () {

                var deleteModal = $uibModal.open({
                    templateUrl: 'app/catalog/delete-entries.html'
                });

                deleteModal.close = function () {

                    var len = $scope.itemsToRemove.length, i = len, entry;

                    for (i; i--;) {

                        entry = $scope.itemsToRemove[i];

                        $scope.entryMap[entry.parentId].totalChildren -= 1;
                        CatalogEntry.remove({id: entry.id}, function () {
                            deleteModal.dismiss();
                        }, function () {
                            messages.add('default');
                        });

                    }
                    $scope.itemsToRemove.length = 0;
                    $window.location.reload();
                }
            };

            $scope.editEntry = function (entry) {
                var editableEntry = angular.copy(entry);
                var editEntryModal = $uibModal.open({
                    templateUrl: 'app/catalog/edit-entry.html',
                    controller: 'EditCatalogEntryController',
                    resolve: {
                        entry: function () {
                            return editableEntry
                        }
                    }
                });
                editEntryModal.close = function (editedEntry, entity) {

                    if (entity) {
                        editedEntry.arachneEntityId = entity.entityId;
                    } else {
                        editedEntry.arachneEntityId = null;
                    }

                    // Use associated entity title as label if label is not set
                    if (!editedEntry.label && entity.title) {
                        editedEntry.label = entity.title;
                    }

                    angular.copy(editedEntry, entry);
                    entry.indexParent = getIndexParent(entry);
                    CatalogEntry.update({id: entry.id}, entry, function () {
                        editEntryModal.dismiss();
                    }, function () {
                        messages.add('default');
                    });
                }
            };

            $scope.editCatalog = function () {
                var editableCatalog = {
                    author: $scope.catalog.author,
                    public: $scope.catalog.public,
                    projectId: $scope.catalog.projectId,
                    root: {
                        label: $scope.catalog.root.label,
                        text: $scope.catalog.root.text
                    }
                };
                var editCatalogModal = $uibModal.open({
                    templateUrl: 'app/catalog/edit-catalog.html',
                    controller: 'EditCatalogController',
                    resolve: {
                        catalog: function () {
                            return editableCatalog
                        }, edit: true
                    }
                });
                editCatalogModal.close = function (editedCatalog) {
                    $scope.catalog.author = editedCatalog.author;
                    $scope.catalog.public = editedCatalog.public;
                    $scope.catalog.projectId = editedCatalog.projectId;
                    $scope.catalog.root.label = editedCatalog.root.label;
                    $scope.catalog.root.text = editedCatalog.root.text;

                    Catalog.update({id: $scope.catalog.id}, $scope.catalog, function () {
                        CatalogEntry.update({id: $scope.catalog.root.id}, $scope.catalog.root, function () {
                            editCatalogModal.dismiss();
                        }, function () {
                            messages.add('default');
                        });
                    }, function () {
                        messages.add('default');
                    });

                }
            };

            $scope.removeCatalog = function () {

                var deleteModal = $uibModal.open({
                    templateUrl: 'app/catalog/delete-catalog.html',
                    controller: 'DeleteCatalogController',
                    scope: $scope
                });

                deleteModal.close = function () {

                    Catalog.remove({id: $scope.catalog.id}, function () {
                        deleteModal.dismiss();
                        $location.url('/catalogs');
                    }, function () {
                        messages.add('default');
                    });
                }
            };

            $scope.currentTreeScope = null;

            $scope.selectEntry = function (entry, treeScope) {

                $state.transitionTo('catalog.entry', {id: $scope.catalog.id, entryId: entry.id}, {notify: true});
                showEntry(entry, treeScope);
            };

            $scope.selectEntity = function (entity) {
                CatalogEntry.list({entityId: entity.entityId}, function (result) {
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].entry.catalogId == $scope.catalog.id) {
                            $scope.selectEntry(result[i].entry);
                            break;
                        }
                    }
                });
            };

            $scope.showHelp = function () {
                $uibModal.open({
                    templateUrl: 'app/catalog/edit-catalog-help.html',
                    controller: 'EditCatalogHelpController'
                });
            };

            $scope.manageEditors = function () {
                var editableCatalog = {
                    userIds: $scope.catalog.userIds,
                };
                var manageEditorModal = $uibModal.open({
                    templateUrl: 'app/catalog/catalog-manage-editor.html',
                    controller: 'ManageEditorController',
                    resolve: {
                        catalog: function () {
                            return editableCatalog
                        }, edit: true
                    }
                });
                manageEditorModal.close = function (editedCatalog) {
                    $scope.catalog.userIds = editedCatalog.userIds;
                    Catalog.update({id: $scope.catalog.id}, $scope.catalog, function () {
                        CatalogEntry.update({id: $scope.catalog.root.id}, $scope.catalog.root, function () {
                            manageEditorModal.dismiss();
                        }, function () {
                            messages.add('default');
                        });
                    }, function () {
                        messages.add('default');
                    });
                }
            };

            $scope.hideMap = function () {
                $scope.map = false;
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
                Catalog.get({id: id, limit: $scope.childrenLimit}, function (result) {
                    initialize(result.root);
                    if (result.root.children.length == 0 && result.root.totalChildren > 0) {
                        $scope.loadChildren(result.root);
                    } else {
                        result.root.children.forEach(initialize);
                    }
                    $scope.catalog = result;
                    checkIfEditable();
                }, function (error) {
                    $scope.error = true;
                    if (error.status == '403') {
                        messages.add('catalog_403');
                    } else {
                        messages.add('default');
                    }
                });
            }

            function showEntry(entry, treeScope) {

                // Toggle collapsed parent when selecting a thumbnail image in catalog preview
                if (!treeScope && $scope.currentTreeScope) {

                    if ($scope.currentTreeScope.collapsed) {
                        $scope.currentTreeScope.toggle();
                    }
                }

                $scope.showThumbnails = false;
                $scope.activeEntry = entry;

                if (entry.arachneEntityId) {
                    Entity.get({id: entry.arachneEntityId}, function (entity) {
                        $scope.activeEntity = entity;
                    }, function () {
                        messages.add('default');
                    });
                } else {

                    if (entry.totalChildren > 0) {
                        showThumbnails(entry, treeScope);
                    } else {
                        $scope.currentTreeScope = null;
                    }
                    $scope.activeEntity = null;
                }
            }

            $scope.showMoreThumbnails = function() {
                $scope.childrenLimit += $scope.showMoreThumbnailsCount;
                showThumbnails($scope.currentEntry);
            };

            function showThumbnails(entry) {

                $scope.currentEntry = entry;
                $scope.cellsNotDisplayed = 0;
                $scope.cells.length = 0;
                $scope.loadingThumbnails = true;

                CatalogEntry.get({id: entry.id, limit: $scope.childrenLimit, offset: 0}, function (result) {

                    result.children.forEach(function (cell, index) {

                        if (cell.arachneEntityId) {

                            Entity.get({id: cell.arachneEntityId}, function (entity) {

                                $scope.cells[index-1] = {
                                    position: index,
                                    title: entity.title,
                                    entityId: entity.thumbnailId,
                                    entity: cell
                                };
                            }, function () {
                                messages.add('default');
                            });
                            index++;
                        } else {
                            $scope.cellsNotDisplayed++;
                        }
                    });

                    $scope.loadingThumbnails = false;
                }, function () {
                    messages.add('backend_missing');
                });

                $scope.showThumbnails = entry.totalChildren > 0;
            }

            function checkIfEditable() {
                if (!$scope.user) {
                    $scope.editable = false;
                } else {

                    var url = arachneSettings.dataserviceUri + '/userinfo/' + $scope.user.username;

                    $http.get(url)
                        .then(function (result) {
                            var user = result.data;
                            $scope.editable = ($scope.catalog.userIds.indexOf(user.id) != -1);
                        }).catch(function () {
                        $scope.editable = false;
                    });
                }
            }

            function loadEntry(entryId, callback) {
                CatalogEntry.get({
                    id: entryId
                }, function (result) {
                    initialize(result);
                    callback(result);
                }, function () {
                    messages.add('backend_missing');
                });
            }

            function toggleParentHierarchy(entryId) {
                getAncestorList(entryId, [], function(list){
                    list.reverse();
                    toggleEntriesInList(list);
                });
            }

            function getAncestorList(entryId, ancestorList, callback) {
                if($scope.entryMap[entryId] === undefined){
                    loadEntry(entryId, function(entry){
                        ancestorList.push(entry);
                        return getAncestorList(entry.parentId, ancestorList, callback)
                    })(ancestorList)
                } // ^- load entry, if not cached already
                else if($scope.entryMap[entryId].parentId) {
                    ancestorList.push($scope.entryMap[entryId]);
                    return getAncestorList($scope.entryMap[entryId].parentId, ancestorList, callback)
                } // ^- use cached entry, if  cached already
                else {
                    return callback(ancestorList);
                } // ^- if cached but no parentId present, we reached the root node and return the list
            }

            function toggleEntriesInList(list) {

                var current = list[0];

                // TODO: better way to do this than using $timeout?
                // i.e. something that explicitly waits until document is retrieved or times out after n milliseconds
                $timeout(function () {
                    document.getElementById("entry-"+current.id).click();
                    if(list.length > 1)
                        return toggleEntriesInList(list.slice(1));
                }, 100);
            }

            retrieveCatalog($stateParams.id);

            if ($stateParams.entryId) {
                CatalogEntry.get({id: $stateParams.entryId}, function (entry) {
                    showEntry(entry);
                    toggleParentHierarchy($stateParams.entryId);
                });
            }

        }
    ]);
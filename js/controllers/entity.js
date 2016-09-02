'use strict';

angular.module('arachne.controllers')

    .controller('EntityController', ['$rootScope', '$stateParams', 'searchService', '$scope', '$uibModal', 'Entity', '$location', 'arachneSettings', 'Catalog', 'CatalogEntry', 'authService', 'categoryService', 'Query', 'message',
        function ($rootScope, $stateParams, searchService, $scope, $uibModal, Entity, $location, arachneSettings, Catalog, CatalogEntry, authService, categoryService, Query, message) {

            $rootScope.hideFooter = false;

            $scope.user = authService.getUser();
            $scope.serverUri = "http://" + document.location.host + document.getElementById('baseLink').getAttribute("href");

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = categories;
            });

            $scope.currentQuery = searchService.currentQuery();

            $scope.catalogEntries = [];
            $scope.activeCatalogEntry = $location.search().catalogEntry;

            $scope.go = function (path) {
                $location.url(path);
            };

            if (authService.getUser()) {
                $scope.catalogs = Catalog.query();
            }

            $scope.previewCatalogEntry = function (catalogEntry) {
                var entityPreview = {
                    title: $scope.entity.title,
                    subtitle: $scope.entity.subtitle,
                    thumbnailId: $scope.entity.thumbnailId
                };
                var preview = $uibModal.open({
                    templateUrl: 'partials/Modals/previewCatalogEntry.html',
                    controller: ['$scope', function ($scope) {
                        $scope.catalogEntry = catalogEntry;
                        $scope.entity = entityPreview;
                    }]
                });
            };

            $scope.createEntry = function () {

                //TODO: Parse Sections in entry.text
                var createEntryPos = $uibModal.open({
                    templateUrl: 'partials/Modals/createEntryPos.html',
                    controller: ['$scope', function ($scope) {
                        $scope.catalogs = Catalog.query()
                    }]
                });
                createEntryPos.close = function (catalog) {
                    var entry = {
                        catalogId: catalog.id,
                        parentId: catalog.root.id,
                        arachneEntityId: $scope.entity.entityId,
                        label: $scope.entity.title
                    };
                    var editEntryModal = $uibModal.open({
                        templateUrl: 'partials/Modals/editEntry.html',
                        controller: 'EditCatalogEntryController',
                        resolve: {
                            entry: function () {
                                return entry
                            }
                        }
                    });
                    editEntryModal.close = function (newEntry) {
                        CatalogEntry.save(newEntry);
                        editEntryModal.dismiss();
                    };
                    createEntryPos.dismiss();
                }
            };

            // TODO Abstract Sections-Template and Logic to seperate unit - for reuse
            // LOGIC for sections-iteration
            $scope.isArray = function (value) {
                if (angular.isArray(value)) {
                    if (value.length == 1) return false;
                    return true;
                }
                return false;
            };

            $scope.updateCatalogEntryParameter = function (catalogEntry) {
                if (catalogEntry)
                    $location.search("catalogEntry", catalogEntry.id);
                else
                    $location.search("catalogEntry", undefined);
            };

            var loadCatalogEntry = function (catalogPath) {
                var catalogEntryIds = catalogPath.split("/");
                if (catalogEntryIds.length < 3)
                    return;

                var catalogId = catalogEntryIds[0];
                var rootEntryId = catalogEntryIds[1];
                var entryId = catalogEntryIds[catalogEntryIds.length - 1];
                var catalogEntry = {id: entryId, catalogId: catalogId};
                $scope.catalogEntries.push(catalogEntry);

                if ($scope.activeCatalogEntry == entryId)
                    catalogEntry.active = true;

                Catalog.get({id: catalogId}, function (catalogObj) {
                    catalogEntry.author = catalogObj.author;
                });

                CatalogEntry.get({id: rootEntryId}, function (rootEntry) {
                    catalogEntry.catalogLabel = rootEntry.label;
                });

                CatalogEntry.get({id: entryId}, function (entry) {
                    catalogEntry.label = entry.label;
                    if (entry.text)
                        catalogEntry.text = entry.text;
                    else
                        catalogEntry.text = "";
                });
            };

            // if no id given, but query get id from search and reload
            if (!$stateParams.id && $scope.currentQuery.hasOwnProperty('resultIndex')) {

                var resultIndex = parseInt($scope.currentQuery.resultIndex);
                searchService.getEntity(resultIndex).then(function (entity) {
                    $location.url('entity/' + entity.entityId + $scope.currentQuery.toString());
                    $location.replace();
                });

            } else {

                Entity.get({id: $stateParams.id}, function (data) {

                    $scope.entity = data;

                    /**
                     * Hide map widget if no marker coordinates are provided
                     * Jan G. Wieners
                     */
                    if (data.places !== undefined) {

                        var cur, locationsExist = false, len = data.places.length;
                        for (var j = len; j--;) {

                            cur = data.places[j].location;
                            if (cur && cur.lat && cur.lon) {
                                locationsExist = true;
                                break;
                            }
                        }
                    }
                    if (!locationsExist) {
                        $scope.entity.places = false;
                    }

                    document.title = $scope.entity.title + " | Arachne";
                    for (var i in $scope.entity.catalogPaths) {
                        loadCatalogEntry($scope.entity.catalogPaths[i]);
                    }

                }, function (response) {
                    $scope.error = true;
                    message.addMessageForCode("entity_" + response.status);
                });

                $scope.contextQuery = new Query();
                $scope.contextQuery.label = "Mit " + $stateParams.id + " verknüpfte Objekte";
                $scope.contextQuery.q = "connectedEntities:" + $stateParams.id;
                $scope.contextQuery.limit = 0;

                if ($scope.currentQuery.hasOwnProperty('resultIndex')) {

                    $scope.resultIndex = parseInt($scope.currentQuery.resultIndex);
                    $scope.resultIndexInput = $scope.resultIndex;
                    searchService.getCurrentPage().then(function (results) {
                        $scope.searchresults = results;
                        $scope.resultSize = searchService.getSize();
                    }, function (response) {
                        $scope.searchresults = {size: 0};
                        message.addMessageForCode('search_' + response.status);
                    });

                    var prevIndex = $scope.resultIndex - 1;
                    $scope.prevEntity = searchService.getEntity(prevIndex).then(function (entity) {
                        $scope.prevEntity = entity;
                    }, function () {
                        $scope.prevEntity = false;
                    });
                    var nextIndex = $scope.resultIndex + 1;
                    $scope.nextEntity = searchService.getEntity(nextIndex).then(function (entity) {
                        $scope.nextEntity = entity;
                    }, function () {
                        $scope.prevEntity = false;
                    });

                }
            }

        }
    ]);
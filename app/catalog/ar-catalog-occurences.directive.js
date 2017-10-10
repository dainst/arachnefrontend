'use strict';

angular.module('arachne.directives')

    .directive('arCatalogOccurences', ['arachneSettings', '$http', '$uibModal', 'Catalog', 'CatalogEntry',
        function (arachneSettings, $http, $uibModal, Catalog, CatalogEntry) {

            return {
                scope: {
                    entity: '='
                },
                templateUrl: 'app/catalog/ar-catalog-occurences.html',
                link: function (scope, element, attrs) {

                    scope.catalogEntries = [];
                    scope.projectEntries = [];

                    scope.previewCatalogEntry = function (catalogEntry) {
                        var entityPreview = {
                            title: scope.entity.title,
                            subtitle: scope.entity.subtitle,
                            thumbnailId: scope.entity.thumbnailId
                        };
                        var preview = $uibModal.open({
                            templateUrl: 'app/catalog/preview-catalog-entry.html',
                            controller: ['$scope', function ($scope) {
                                $scope.catalogEntry = catalogEntry;
                                $scope.entity = entityPreview;
                            }]
                        });
                    };

                    scope.createEntry = function () {
                        //TODO: Parse Sections in entry.text
                        var createEntryPos = $uibModal.open({
                            templateUrl: 'app/catalog/create-entry-pos.html',
                            controller: ['$scope', function ($scope) {
                                $scope.catalogs = Catalog.query()
                            }]
                        });
                        createEntryPos.close = function (catalog) {
                            var entry = {
                                catalogId: catalog.id,
                                parentId: catalog.root.id,
                                arachneEntityId: scope.entity.entityId,
                                label: scope.entity.title
                            };
                            var editEntryModal = $uibModal.open({
                                templateUrl: 'app/catalog/edit-entry.html',
                                controller: 'EditCatalogEntryController',
                                resolve: {
                                    entry: function () {
                                        return entry
                                    }
                                }
                            });
                            editEntryModal.close = function (newEntry) {
                                CatalogEntry.save(newEntry, function (data) {
                                    if (data.error_message) {
                                        console.log(data.error_message);
                                    } else {
                                        scope.loadOccurences();
                                    }
                                });
                                editEntryModal.dismiss();
                            };
                            createEntryPos.dismiss();
                        }
                    };

                    scope.loadOccurences = function () {

                        if (scope.entity) {

                            var url = arachneSettings.dataserviceUri + "/catalog/list/" + scope.entity.entityId;

                            $http.get(url).then(function (result) {

                                scope.catalogEntries = result.data;

                                var i = 0, len = scope.catalogEntries.length, cur;

                                for (i; i < len; i++) {

                                    if (scope.catalogEntries[i].projectId) {
                                        scope.projectEntries.push(scope.catalogEntries[i]);
                                    }
                                }

                                scope.deleteDuplicateCatalogueEntries();

                            }).catch(function (result) {
                                console.log("Error Arachne dataservice not reachable");
                            });
                        }
                    };

                    scope.deleteDuplicateCatalogueEntries = function() {

                        var entries = [], i, j, len = scope.catalogEntries.length, curi, curj, num = 0;

                        for (i = 0; i < len; i++) {

                            curi = scope.catalogEntries[i];

                            if (curi.duplicate) continue;

                            for (j = 0; j < len; j++) {

                                if (j === i) continue;

                                curj = scope.catalogEntries[j];

                                if (curi.entry.catalogId === curj.entry.catalogId) {

                                    if (curi.entry.indexParent !== 0) {
                                        entries[num++] = curi;
                                    } else if (curj.entry.indexParent !== 0) {
                                        entries[num++] = curj;
                                    } else {
                                        entries[num++] = curi;
                                    }
                                    curi.duplicate = curj.duplicate = true;
                                }
                            }

                            if (!curi.duplicate) {
                                entries[num++] = curi;
                            }
                        }

                        scope.catalogEntries = entries;
                    };

                    scope.$watch('entity', function () {
                        scope.loadOccurences();
                    });
                }
            }
        }
    ]);
'use strict';

angular.module('arachne.controllers')

/**
 * @author: Jan G. Wieners
 * @author: Thomas Kleinke
 * @author Patrick Jominet
 */


    .controller('SearchController', ['$rootScope', '$scope', 'searchService', 'categoryService', '$filter',
        'arachneSettings', '$location', 'Catalog', 'CatalogEntry', 'messageService', '$uibModal', '$http', 'Entity',
        'authService', '$timeout', 'searchScope',
        function ($rootScope, $scope, searchService, categoryService, $filter,
                  arachneSettings, $location, Catalog, CatalogEntry, messages, $uibModal, $http, Entity,
                  authService, $timeout, searchScope) {

            searchService.initQuery();

            // To indicate that the query will not be performed because it violates one or more constraints of some sort
            $scope.illegalQuery = false;
            $rootScope.tinyFooter = false;
            $scope.user = authService.getUser();
            $scope.currentQuery = searchService.currentQuery();

            $scope.getSearchTitle = searchScope.currentScopeTitle;

            $scope.q = angular.copy($scope.currentQuery.q);
            $scope.sortableFields = arachneSettings.sortableFields;

            var HIDDEN_FACETS = ['agg_geogrid', 'facet_geo'];

            // Ignore unknown sort fields
            if (arachneSettings.sortableFields.indexOf($scope.currentQuery.sort) === -1) {
                delete $scope.currentQuery.sort;
            }

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = categories;
            });

            $scope.openDownloadDialog = function() {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/export/download-modal.html',
                    controller: 'DownloadController',
                    resolve: {
                        downloadUrl: function() {
                            return '/search';
                        },
                        downloadParams: function() {
                            var finalQuery = $scope.currentQuery.extend(searchScope.currentScopeData());
                            // failsafe control if query is empty
                            if (angular.isUndefined(finalQuery.q === undefined)) {
                                finalQuery.q = '*';
                            }
                            finalQuery = finalQuery.setParam('limit', searchService.getSize());
                            finalQuery = finalQuery.setParam('fl', 1);
                            return finalQuery.toFlatObject();
                        }
                    }
                });
                modalInstance.result.then(function() {
                    $window.location.reload();
                });
            };

            $scope.createCatalogTextForCurrentQuery = function () {

                var curQuery = $scope.currentQuery,
                    text = curQuery.toFlatObject().q,
                    facets = curQuery.toFlatObject().fq,
                    len = facets.length;

                for (var i = 0; i < len; i++) {
                    text += " " + curQuery.toFlatObject().fq[i];
                }

                return text;
            };

            $scope.createCatalogEntryText = function (entity) {

                var catalogEntryText = "";

                for (var i in entity.sections) {
                    catalogEntryText += $scope.createSectionText(entity.sections[i], true) + " \n";
                }

                return catalogEntryText;
            };

            $scope.createSectionText = function (section, firstLevel) {

                if (!section.content || section.content.length === 0) return "";

                var sectionText = "";
                if (section.label && section.label.length > 0) {
                    sectionText += firstLevel ? "#" : "###";
                    sectionText += " " + section.label + "\n";
                }

                for (var i in section.content) {
                    if (section.content[i].value) {
                        var value = "";
                        if (Array.isArray(section.content[i].value)) {
                            for (var j in section.content[i].value) {
                                value += section.content[i].value[j] + "  \n";
                            }
                        } else {
                            value = section.content[i].value;
                        }
                        value = value.replace(/<hr>/g, "  \n").replace(/<hr\/>/g, "  \n").replace(/<hr \/>/g, "  \n")
                            .replace(/-/g, "\\-").replace(/\*/g, "\\*").replace(/#/g, "\\#")
                            .replace(/<a href="(.*?)"( target="_blank")?>(.*?)<\/a>/g, "[$3]($1)");
                        sectionText += value + "  \n";
                    } else {
                        sectionText += $scope.createSectionText(section.content[i], false) + "  \n";
                    }
                }

                return sectionText;
            };

            $scope.openCatalogModal = function() {
                
                if (searchService.getSize() > arachneSettings.maxSearchSizeForCatalog) {
                    return;
                }

                let catalogModal = $uibModal.open({
                    templateUrl: 'app/catalog/edit-catalog.html',
                    controller: 'EditCatalogController',
                    resolve: {
                        catalog: {
                            author: $scope.user.username,
                            root: {
                                label: $scope.currentQuery.label,
                                text: $scope.createCatalogTextForCurrentQuery(),
                                children: []
                            },
                            generateTexts: false
                        }
                    }
                });

                catalogModal.close = function(catalog) {

                    catalogModal.dismiss();

                    if (catalog) {

                        $scope.entitiesBuilt = 0;
                        $scope.entitiesAdded = 0;
                        $scope.catalogCreationCancelled = false;

                        $uibModal.open({
                            templateUrl: 'app/catalog/catalog-progress.html',
                            scope: $scope,
                        }).result.catch(() => {
                            $scope.catalogCreationCancelled = true;
                            Catalog.delete({ id: $scope.catalogId });
                        });

                        Catalog.save({}, catalog).$promise.then(result => {
                            $scope.catalogId = result.id;
                            $scope.createCatalogEntries(result, catalog.generateTexts);
                        });
                    }
                }
            };

            $scope.processCatalogEntities = function(catalog, entities, generateTexts) {

                if ($scope.catalogCreationCancelled) return;

                var promises = entities.map(entity => {
                    return Entity.get({id: entity.entityId}).$promise
                        .then(entity => $scope.buildCatalogEntry(entity, catalog, generateTexts))
                        .catch(err => console.warn(err));
                });

                Promise.all(promises)
                    .then(entries => $scope.addCatalogEntries(entries))
                    .then(entries => $scope.$applyAsync(() => $scope.entitiesAdded += entries.length));
            };

            $scope.buildCatalogEntry = function(entity, catalog, generateTexts) {

                let title = entity.title || "";

                return {
                    arachneEntityId: entity.entityId,
                    label: title,
                    text: generateTexts ? $scope.createCatalogEntryText(entity) : "",
                    catalogId: catalog.id,
                    indexParent: $scope.entitiesBuilt++,
                    parentId: catalog.root.id,
                };
            };

            $scope.addCatalogEntries = function(entries) {

                if ($scope.catalogCreationCancelled) return Promise.reject();

                return CatalogEntry.save({}, entries).$promise;
            };

            $scope.createCatalogEntries = function(catalog, generateTexts) {

                $scope.createCatalogEntriesForBatch(catalog, generateTexts);
            };

            $scope.createCatalogEntriesForBatch = function(catalog, generateTexts, offset=0) {

                if ($scope.catalogCreationCancelled) return;

                var query = $scope.currentQuery.toFlatObject();
                if (query.q === "") {
                    query.q = "*";
                }

                angular.extend(query, {
                    offset, limit: arachneSettings.batchSizeForCatalog
                });

                var entityQuery = Entity.query(query);

                entityQuery.$promise.then(function (result) {
                    if (result.entities) {
                        $scope.processCatalogEntities(catalog, result.entities, generateTexts);
                        if (offset + arachneSettings.batchSizeForCatalog < searchService.getSize()) {
                            $scope.createCatalogEntriesForBatch(catalog, generateTexts, offset + arachneSettings.batchSizeForCatalog);
                        }
                    } else {
                        console.warn('No entities could be retrieved.');
                    }
                }, function (err) {
                    console.warn('Error in retrieving entities.', err);
                });
            }

            $scope.go = function (path) {
                $location.url(path);
            };

            $scope.previousPage = function () {
                if ($scope.currentPage > 1)
                    $scope.currentPage -= 1;
                $scope.onSelectPage();
            };

            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.totalPages)
                    $scope.currentPage += 1;
                $scope.onSelectPage();
            };

            $scope.onSelectPage = function () {
                var newOffset = ($scope.currentPage - 1) * $scope.currentQuery.limit;
                $location.url(searchScope.currentScopePath() + 'search' + $scope.currentQuery.setParam('offset', newOffset).toString());
            };

            $scope.loadMoreFacetValues = function (facet) {
                searchService.loadMoreFacetValues(facet).then(function (hasMore) {
                    facet.hasMore = hasMore;
                }, function (response) {
                    if (response.status === '404') messages.add('backend_missing');
                    else messages.add('search_' + response.status);
                });
            };


            function _buildFacetGroups() {
                $scope.facetGroups = {};

                var facetNames = $scope.facets.map(function(facet) {
                    return facet.name;
                });


                $scope.facets

                    .filter(function(facet) {
                        if (facet.dependsOn === null) {
                            return true;
                        }
                        return (facetNames.indexOf('facet_' + facet.dependsOn) < 0);
                    })

                    .map(function(facet) {
                        var group = (facet.group) ? facet.group : facet.name;
                        if (typeof $scope.facetGroups[group] === "undefined") {
                            $scope.facetGroups[group] = [];
                        }
                        $scope.facetGroups[group].push(facet);
                    });

            }

            $scope.openFacetModal = function (facet){

                //$location.url(searchScope.currentScopePath() + 'search' + $scope.currentQuery + '&facet=' + facet.name);

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/search/facet-value-modal.html',
                    controller: 'FacetValueModalController',
                    resolve: {
                        facet: function(){
                            return facet;
                        }
                    }
                });

                modalInstance.result.then(function (user) {
                    $window.location.reload();
                });

            };


            $scope.printCategoryName = function(entityName) {
                var cur;
                for (var category in $scope.categories) {
                    cur = $scope.categories[category];
                    if ((cur.queryTitle === entityName) || (cur.key === entityName)) {
                        return cur.singular;
                    }
                }
                return "";
            };

            $scope.getSearchPath = function() {
                return searchScope.currentScopePath();
            };

            $scope.getUrlForFacetValue = function(facetName, facetValue) {
                var query = $scope.currentQuery.addFacet(facetName, facetValue)
                    .removeParam('offset');
                return "search" + query.toString();
            };

            if (parseInt($scope.currentQuery.limit) + parseInt($scope.currentQuery.offset) > 10000) {
                $timeout(function () { // unfortunately we have to do this to wait for the translations to load.
                    messages.clear();
                    messages.add('ui_search_too_big', 'warning', false);
                    $scope.illegalQuery = true;
                }, 1000);

            } else {
                searchService.getCurrentPage().then(function (entities) {
                    $scope.entities = entities;
                    $scope.resultSize = searchService.getSize();
                    $scope.totalPages = Math.ceil($scope.resultSize / $scope.currentQuery.limit);
                    $scope.currentPage = $scope.currentQuery.offset / $scope.currentQuery.limit + 1;
                    $scope.facets = searchService.getFacets();
                    $scope.facets = $scope.facets.filter(function(facet) {
                        return (HIDDEN_FACETS.indexOf(facet.name) === -1);
                    });
                    _buildFacetGroups();
                    var insert = [];

                    // separate default facets from the rest, to display them first
                    $scope.defaultFacets = [];
                    arachneSettings.openFacets.forEach(function(openName) {
                        if (openName in $scope.facetGroups) {
                            $scope.defaultFacets.push($scope.facetGroups[openName][0]);
                            delete $scope.facetGroups[openName];
                        }
                    });

                    for (var i = 0; i < $scope.facets.length; i++) {
                        var facet = $scope.facets[i];
                        facet.open = false;
                        facet.hasMore = facet.values.length >= $scope.currentQuery.fl;
                        arachneSettings.openFacets.forEach(function (openName) {
                            if (facet.name.slice(0, openName.length) === openName) {
                                insert.unshift($scope.facets.splice(i--, 1)[0]);
                                facet.open = true;
                            }
                        });
                    }
                    insert.forEach(function (facet) {
                        $scope.facets.unshift(facet);
                    });
                    $scope.cells = $filter('cellsFromEntities')(entities, $scope.currentQuery);
                }, function (response) {
                    $scope.resultSize = 0;
                    $scope.error = true;
                    messages.add((response.status === '404') ? 'backend_missing' : 'search_' + response.status);
                });

            }


        }
    ]);

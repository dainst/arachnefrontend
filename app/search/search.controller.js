'use strict';

angular.module('arachne.controllers')

/**
 * @author: Jan G. Wieners
 * @author: Thomas Kleinke
 * @author Patrick Jominet
 */


    .controller('SearchController', ['$rootScope', '$scope', 'searchService', 'categoryService', '$filter',
        'arachneSettings', '$location', 'Catalog', 'messageService', '$uibModal', '$http', 'Entity',
        'authService', '$timeout', 'searchScope',
        function ($rootScope, $scope, searchService, categoryService, $filter,
                  arachneSettings, $location, Catalog, messages, $uibModal, $http, Entity,
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
                            .replace(/-/g, "\\-").replace(/\*/g, "\\*").replace(/#/g, "\\#");
                        sectionText += value + "  \n";
                    } else {
                        sectionText += $scope.createSectionText(section.content[i], false) + "  \n";
                    }
                }

                return sectionText;
            };

            $scope.processCatalogEntities = function (entities) {

                var catalogFromSearch = $uibModal.open({
                    templateUrl: 'app/catalog/edit-catalog.html',
                    controller: 'EditCatalogController',
                    resolve: {
                        catalog: function () {
                            return {
                                author: $scope.user.username,
                                root: {
                                    label: $scope.currentQuery.label,
                                    text: $scope.createCatalogTextForCurrentQuery()
                                },
                                generateTexts: false
                            }
                        }
                    }
                });

                catalogFromSearch.close = function (newCatalog) {
                    newCatalog.root.children = [];

                    var len = entities.length;
                    $scope.entitiesToAdd = len;

                    for (var i = 0; i < len; i++) {
                        Entity.get({id: entities[i].entityId}, function (entity) {
                            $scope.addCatalogEntry(newCatalog, entity);
                        }, function (success) {
                            messages.add('default');
                        }, function (error) {
                            messages.add('default');
                        });
                    }

                    catalogFromSearch.dismiss();
                }
            };

            $scope.addCatalogEntry = function (catalog, entity) {

                var title = entity.title || "";

                catalog.root.children.push({
                    "arachneEntityId": entity.entityId,
                    "label": title,
                    "text": catalog.generateTexts ? $scope.createCatalogEntryText(entity) : ""
                });

                if (--$scope.entitiesToAdd === 0) {
                    delete catalog.generateTexts;
                    Catalog.save({}, catalog,
                        function (result) { /* success */
                        },
                        function (error) {
                            messages.add('default');
                            console.warn(error)
                        });
                }
            };

            $scope.createCatalogFromSearch = function () {
                
                if (searchService.getSize() > arachneSettings.maxSearchSizeForCatalog) {
                    return;
                }

                var query = $scope.currentQuery.toFlatObject();
                if (query.q === "") {
                    query.q = "*";
                }

                angular.extend(query, {
                    offset: 0, limit: arachneSettings.maxSearchSizeForCatalog
                });

                var entityQuery = Entity.query(query);

                entityQuery.$promise.then(function (result) {
                    if (result.entities) {
                        $scope.processCatalogEntities(result.entities);
                    } else {
                        console.warn('No entities could be retrieved.');
                    }
                }, function (err) {
                    console.warn('Error in retrieving entities.', err);
                });
            };

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

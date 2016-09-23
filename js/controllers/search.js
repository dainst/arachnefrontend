'use strict';

angular.module('arachne.controllers')

/**
 * @author: Jan G. Wieners
 * @author: Thomas Kleinke
 */

    .controller('SearchController', ['$rootScope', '$scope', 'searchService', 'categoryService', '$filter', 'arachneSettings', '$location', 'Catalog', 'message', '$uibModal', '$http', 'Entity', 'authService', '$timeout',
        function ($rootScope, $scope, searchService, categoryService, $filter, arachneSettings, $location, Catalog, message, $uibModal, $http, Entity, authService, $timeout) {

            // To indicate that the query will not be performed because it violates one or more constraints of some sort
            $scope.illegalQuery = false;
            $rootScope.hideFooter = false;
            $scope.user = authService.getUser();
            $scope.currentQuery = searchService.currentQuery();
            $scope.q = angular.copy($scope.currentQuery.q);
            $scope.sortableFields = arachneSettings.sortableFields;

            // Ignore unknown sort fields
            if (arachneSettings.sortableFields.indexOf($scope.currentQuery.sort) == -1) {
                delete $scope.currentQuery.sort;
            }

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = categories;
            });

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

            $scope.createCatalogEntryText = function(entity) {

                var catalogEntryText = "";

                for (var i in entity.sections) {
                    catalogEntryText += $scope.createSectionText(entity.sections[i], true) + " \n";
                }

                return catalogEntryText;
            };

            $scope.createSectionText = function(section, firstLevel) {

                if (!section.content || section.content.length == 0) return "";

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
                    templateUrl: 'partials/Modals/editCatalog.html',
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

                    for (var i = len; i--;) {

                        Entity.get({id: entities[i].entityId}, function(entity) {
                            $scope.addCatalogEntry(newCatalog, entity);
                        }, function() {
                            message.addMessageForCode('default');
                        });
                    }

                    catalogFromSearch.dismiss();
                }
            };

            $scope.addCatalogEntry = function(catalog, entity) {

                catalog.root.children.push({
                    "arachneEntityId": entity.entityId,
                    "label": entity.title,
                    "text": catalog.generateTexts ? $scope.createCatalogEntryText(entity) : ""
                });

                if (--$scope.entitiesToAdd == 0) {
                    delete catalog.generateTexts;
                    Catalog.save({}, catalog, function (result) {});
                }
            };

            $scope.createCatalogFromSearch = function () {

                if (searchService.getSize() > 999) {
                    return;
                }

                var entityQuery = Entity.query(angular.extend($scope.currentQuery.toFlatObject(), {
                    offset: 0, limit: 1000
                }));

                entityQuery.$promise.then(function (result) {

                    if (result.entites) {
                        $scope.processCatalogEntities(result.entities)
                    } else {
                        console.log('No entities could be retrieved.');
                    }
                }, function (err) {
                    console.log('Error in retrieving entities.', err);
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
                $location.url('search' + $scope.currentQuery.setParam('offset', newOffset).toString());
            };

            $scope.loadMoreFacetValues = function (facet) {
                searchService.loadMoreFacetValues(facet).then(function (hasMore) {
                    facet.hasMore = hasMore;
                    console.log(facet.name, facet.hasMore);
                }, function (response) {
                    if (response.status == '404') message.addMessageForCode('backend_missing');
                    else message.addMessageForCode('search_' + response.status);
                });
            };


            if (parseInt($scope.currentQuery.limit) + parseInt($scope.currentQuery.offset) > 10000) {

                $timeout(function () { // unfortunately we have to do this to wait for the translations to load.
                    message.clear();
                    message.addMessageForCode('ui_search_too_big', 'warning', false);
                    $scope.illegalQuery = true;
                }, 1000);

            } else {

                searchService.getCurrentPage().then(function (entities) {

                    $scope.entities = entities;
                    $scope.resultSize = searchService.getSize();
                    $scope.totalPages = Math.ceil($scope.resultSize / $scope.currentQuery.limit);
                    $scope.currentPage = $scope.currentQuery.offset / $scope.currentQuery.limit + 1;
                    $scope.facets = searchService.getFacets();
                    var insert = [];

                    for (var i = 0; i < $scope.facets.length; i++) {

                        var facet = $scope.facets[i];
                        facet.open = false;
                        if (facet.values.length < $scope.currentQuery.fl) {
                            facet.hasMore = false;
                        } else {
                            facet.hasMore = true;
                        }
                        arachneSettings.openFacets.forEach(function (openName) {
                            if (facet.name.slice(0, openName.length) == openName) {
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
                    if (response.status == '404') message.addMessageForCode('backend_missing');
                    else message.addMessageForCode('search_' + response.status);
                });

            }

        }
    ]);
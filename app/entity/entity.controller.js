'use strict';

angular.module('arachne.controllers')

    .controller('EntityController', ['$rootScope', '$stateParams', 'searchService', '$scope', '$uibModal', 'Entity', '$location', 'arachneSettings', 'Catalog', 'CatalogEntry', 'authService', 'categoryService', 'Query', 'messageService',
        function ($rootScope, $stateParams, searchService, $scope, $uibModal, Entity, $location, arachneSettings, Catalog, CatalogEntry, authService, categoryService, Query, messages) {

            $rootScope.hideFooter = false;

            $scope.user = authService.getUser();
            $scope.serverUri = "http://" + document.location.host + document.getElementById('baseLink').getAttribute("href");

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = categories;
            });

            $scope.currentQuery = searchService.currentQuery();

            $scope.goToResultIndex = function (resultIndex) {
                if (resultIndex > 0 && resultIndex <= $scope.resultSize) {
                    $location.url('/entity/' + $scope.currentQuery.setParam('resultIndex',resultIndex).toString());
                }
            };

            // if no id given, but query get id from search and reload
            if (!$stateParams.id && $scope.currentQuery.hasOwnProperty('resultIndex')) {

                var resultIndex = parseInt($scope.currentQuery.resultIndex);
                searchService.getEntity(resultIndex).then(function (entity) {
                    $location.url('entity/' + entity.entityId + $scope.currentQuery.toString());
                    $location.replace();
                });

            } else {

                var live = $location.search()["live"] == "true";

                Entity.get({id: $stateParams.id, live: live}, function (data) {

                    $scope.entity = data;
                    // very ugly exception for Berliner Skulpturennetzwerk
                    // hide all data not in datenblatt_berlin
                    if (data.sections[0].label == 'Datenblatt Berlin') {
                        data.sections = data.sections.slice(0,1);
                    }
                    categoryService.getCategoryHref($scope.entity.type).then(function (categoryHref) {
                        $scope.entity.categoryHref = categoryHref;
                    });
                    categoryService.getCategoryKey($scope.entity.type).then(function (key) {
                        $scope.entity.categoryKey = key;
                    });

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

                    $scope.entity.lastModified = new Date(data.lastModified).toISOString();

                    document.title = $scope.entity.title + " | Arachne";

                }, function (response) {
                    $scope.error = true;
                    messages.add("entity_" + response.status);
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
                        messages.add('search_' + response.status);
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

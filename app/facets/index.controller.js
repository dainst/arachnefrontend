angular.module('arachne.controllers')
/**
 * Allows browsing in facets and dependent facet values
 *
 * controls the display of facets and facet values
 * based on dependent selections saved as URL params
 *
 * @author
 * @author Patrick Jominet
 */
    .controller('IndexController', ['$rootScope', '$scope', 'categoryService', 'Entity', 'Query', '$stateParams', '$http', '$filter', '$location', 'indexService',
        function ($rootScope, $scope, categoryService, Entity, Query, $stateParams, $http, $filter, $location, indexService) {
            $scope.currentCategory = undefined;
            $scope.currentFacet = undefined;
            $scope.currentValue = undefined;
            $scope.groupedBy = undefined;
            $scope.entityResultSize = 0;

            $scope.minPanelSize = 14;
            $scope.panelSize = $scope.minPanelSize;

            $scope.previousFacetPage = function () {
                $scope.currentFacetPage -= 1;
            };

            $scope.nextFacetPage = function () {
                $scope.currentFacetPage += 1;
            };

            $scope.previousValuePage = function () {
                $scope.currentValuePage -= 1;
            };

            $scope.nextValuePage = function () {
                $scope.currentValuePage += 1;
            };

            /**
             * Reload view if URL gets changed (e.g. additional params added)
             */
            $scope.$on('$locationChangeSuccess', function (event, url1) {
                if ($rootScope.isOnPage(url1, ["index"])) {
                    load();
                }

            });

            /**
             * Load facets and facet values combined
             */
            function load() {
                loadFacets();
                loadFacetValues();
                updatePreviewResultSize();
            }

            /**
             * Build a query from facets and/or facet values
             * to be used in a search request
             *
             * @return query object with all selected facets and facet values and '*' as query string
             */
            function getCurrentQuery() {
                var query = new Query();

                // the selected facet
                if ($stateParams.c) {
                    query = query.addFacet("facet_kategorie", $stateParams.c)
                }

                // the selected facet value
                if ($stateParams.fq && $stateParams.fv) {
                    query = query.addFacet($stateParams.fq, $stateParams.fv)
                }

                query.q = "*";
                return query;
            }

            /**
             * make a search request with the selected facet values from current query
             * change location in doing so
             */
            $scope.startIndexSearch = function () {
                $location.url("search" + getCurrentQuery().toString());
            };

            /**
             * Request the number of results are found by the current facet/facet value combination
             */
            function updatePreviewResultSize() {
                Entity.query(getCurrentQuery().toFlatObject(), function (response) {
                    $scope.entityResultSize = response.size;
                });
            }

            /**
             * Load categories and sort them alphabetically
             * categoryService loads category data from json
             *
             * set panel size accordingly to the number of categories
             */
            categoryService.getCategoriesAsync().then(function (categories) {

                var temp = [];
                for (var key in categories) {
                    if (categories[key].status !== 'none') {
                        temp.push(categories[key]);
                    }
                }

                if (temp.length >= $scope.minPanelSize) $scope.panelSize = temp.length;

                $scope.categories = temp.sort(function (a, b) {
                    if (a.title < b.title) return -1;
                    else if (a.title > b.title) return 1;
                    else return 0;
                });
            });

            /**
             * Load facets for a selected category from url param 'c'
             * and create panel paging accordingly
             */
            function loadFacets() {
                if ($stateParams.c) {
                    // no selection changes
                    if ($stateParams.c === $scope.currentCategory) return;

                    $scope.currentCategory = $stateParams.c;
                    $scope.currentFacet = $stateParams.fq;

                    indexService.loadFacetsAsync($stateParams.c).then(function (filteredFacets) {
                        var itemsPerPage = 0;
                        var pageCounter = 0;
                        // an array containing pages and their respective facets
                        $scope.facets = [[]];
                        $scope.facetCount = filteredFacets.length;

                        $scope.currentFacetPage = 0;
                        for (var i = 0; i < filteredFacets.length; i++) {
                            // determine number of pages and add pages to array
                            if (itemsPerPage === $scope.panelSize) {
                                $scope.facets.push([]);
                                pageCounter += 1;
                                itemsPerPage = 0;
                            }

                            // Page selection based on selected facet?
                            if (filteredFacets[i].name === $scope.currentFacet) {
                                $scope.currentFacetPage = pageCounter;
                            }

                            // add facets to pages
                            $scope.facets[pageCounter].push(filteredFacets[i]);
                            itemsPerPage += 1;
                        }
                        $scope.resultSize = filteredFacets.size;
                    });

                } else {
                    $scope.facets = undefined;
                    $scope.facetValues = undefined;
                }
            }

            /**
             * Load facets values for a selected facet from url param 'fq', 'fv' and 'group'
             * and create panel paging accordingly
             */
            function loadFacetValues() {
                if ($stateParams.fq) {
                    // no selection changes
                    if ($scope.currentFacet === $stateParams.fq
                        && $scope.currentValue === $stateParams.fv
                        && $scope.groupedBy === $stateParams.group
                        && $scope.facetValues) {
                        return;
                    }

                    // ?
                    if ($scope.groupedBy !== $stateParams.group) {
                        $scope.currentValuePage = 0;
                    }

                    $scope.currentFacet = $stateParams.fq;
                    $scope.currentValue = $stateParams.fv;

                    // construct query url to get facet values
                    var url = '/data/index/' + $stateParams.c + '/' + $stateParams.fq;
                    if ($stateParams.group) {
                        $scope.groupedBy = $stateParams.group;
                        url += "?group=" + $scope.groupedBy;
                    } else $scope.groupedBy = undefined;

                    indexService.loadFacetValuesAsync(url).then(function (preprocessedValues) {
                        var itemsPerPage = 0;
                        var pageCounter = 0;
                        // an array containing pages and their respective facet values
                        $scope.facetValues = [[]];
                        $scope.valuesCount = preprocessedValues.length;

                        // ?
                        if (preprocessedValues.length + 2 < $scope.panelSize)
                            $scope.valueRows = 1;
                        else $scope.valueRows = 2;

                        $scope.currentValuePage = 0;
                        for (var i = 0; i < preprocessedValues.length; i++) {
                            // determine number of pages and add pages to array
                            if (itemsPerPage + 2 === $scope.panelSize * 2) {
                                $scope.facetValues.push([]);
                                pageCounter += 1;
                                itemsPerPage = 0;
                            }

                            // Page selection based on selected facet value?
                            if (preprocessedValues[i] === $scope.currentValue) {
                                $scope.currentValuePage = pageCounter;
                            }

                            // add facet values to pages
                            $scope.facetValues[pageCounter].push(preprocessedValues[i]);
                            itemsPerPage += 1;
                        }
                    });

                } else {
                    $scope.facetValues = undefined;
                    $scope.currentValue = undefined;
                }
            }

            // load data on script execution
            load();
        }
    ]);

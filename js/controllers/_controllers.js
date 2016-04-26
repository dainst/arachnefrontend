'use strict';

/* Controllers */

angular.module('arachne.controllers', ['ui.bootstrap'])

    .controller('SearchFormController', ['$scope', '$location',
        function ($scope, $location) {

            $scope.search = function (fq) {
                if ($scope.q) {
                    var url = '/search?q=' + $scope.q;
                    if (fq) url += "&fq=" + fq;
                    $scope.q = null;
                    $location.url(url);
                }
            }

        }
    ])
    
    .controller('SearchController', ['$rootScope', '$scope', 'searchService', 'categoryService', '$filter', 'arachneSettings', '$location', 'Catalog', 'message', '$uibModal', '$http', 'Entity', 'authService',
        function ($rootScope, $scope, searchService, categoryService, $filter, arachneSettings, $location, Catalog, message, $uibModal, $http, Entity, authService) {

            $rootScope.hideFooter = false;
            $scope.user = authService.getUser();

            $scope.currentQuery = searchService.currentQuery();
            $scope.q = angular.copy($scope.currentQuery.q);
            //$scope.user = authService.getUser();

            $scope.sortableFields = arachneSettings.sortableFields;
            // ignore unknown sort fields
            if (arachneSettings.sortableFields.indexOf($scope.currentQuery.sort) == -1) {
                delete $scope.currentQuery.sort;
            }

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = categories;
            });

            //-------------------- Query to Catalog --------------
            $scope.toCatalog = function () {
                var count = searchService.getSize();
                var off = 0;
                var error = false;
                $scope.catalogEntries = [];

                if (count >= 1000)
                    return;

                while (count >= 0) {
                    var query = angular.extend({offset: off, limit: 50}, $scope.currentQuery.toFlatObject());
                    var entities = Entity.query(query);

                    setTimeout(function () {
                        if (!entities.entities) {
                            //zu lagsam, mehr Zeit
                            setTimeout(function () {
                                for (var i = 0; i <= entities.entities.length - 1; i++) {
                                    $scope.catalogEntries[off + i] = {
                                        "arachneEntityId": entities.entities[i].entityId,
                                        "label": entities.entities[i].title,
                                        "text": entities.entities[i].subtitle
                                    }
                                }
                                off += 50;
                            }, 1000);

                        } else {
                            for (var i = 0; i <= entities.entities.length - 1; i++) {
                                $scope.catalogEntries[off + i] = {
                                    "arachneEntityId": entities.entities[i].entityId,
                                    "label": entities.entities[i].title,
                                    "text": entities.entities[i].subtitle
                                }
                            }
                            off += 50;
                        }

                    }, 500);

                    count -= 50;
                }

                var text = $scope.currentQuery.toFlatObject().q;

                for (var i = 0; i <= $scope.currentQuery.toFlatObject().fq.length - 1; i++) {
                    text = text + " " + $scope.currentQuery.toFlatObject().fq[i];
                }
                if (!error) {
                    var bufferCatalog = {
                        author: $scope.user.username,
                        root: {
                            label: $scope.currentQuery.label,
                            text: text,
                            children: $scope.catalogEntries
                        }
                    };
                    var catalogFromSearch = $uibModal.open({
                        templateUrl: 'partials/Modals/editCatalog.html',
                        controller: 'EditCatalogController',
                        resolve: {
                            catalog: function () {
                                return bufferCatalog
                            }
                        }
                    });
                    catalogFromSearch.close = function (newCatalog) {
                        newCatalog.public = false;
                        Catalog.save({}, newCatalog, function (result) {
                        });
                        catalogFromSearch.dismiss();
                    }
                }
            };

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

        }
    ])

    .controller('CategoryController', ['$rootScope', '$scope', '$uibModal', 'Query', '$http', 'arachneSettings', 'categoryService', '$location', 'Entity',
        function ($rootScope, $scope, $uibModal, Query, $http, arachneSettings, categoryService, $location, Entity) {

            $rootScope.hideFooter = false;

            $scope.category = $location.search().c;

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.title = categories[$scope.category].title;
                $scope.imgUri = categories[$scope.category].imgUri;
                $scope.subtitle = categories[$scope.category].subtitle;
                $scope.mapfacet = categories[$scope.category].geoFacet;

                $scope.currentQuery = new Query().addFacet("facet_kategorie", $scope.title);
                $scope.currentQuery.q = "*";

                Entity.query($scope.currentQuery.toFlatObject(), function (response) {
                    $scope.facets = response.facets;
                    $scope.resultSize = response.size;
                });
            });

        }
    ])

    .controller('MapMenuController', ['$scope', 'searchService',
        function ($scope, searchService) {

            $scope.leftMenuToggled = true;
            $scope.rightMenuToggled = true;

            $scope.overlaysActive = function () {
                return (searchService.currentQuery().overlays ? true : false);
            }
        }
    ])

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

            $scope.createEntry = function () {
                //TODO: Parse Secitons in entry.text
                var createEntryPos = $uibModal.open({
                    templateUrl: 'partials/Modals/createEntryPos.html',
                    controller: function ($scope) {
                        $scope.catalogs = Catalog.query()
                    }
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
                    var cur, locationsExist = false, len = data.places.length;
                    for (var j = len; j--;) {

                        cur = data.places[j].location;
                        if (cur && cur.lat && cur.lon) {
                            locationsExist = true;
                            break;
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
    ])

    .controller('EntityImageController', ['$stateParams', '$scope', '$uibModal', 'Entity', 'authService', 'searchService', '$location', 'arachneSettings', '$http', '$window', '$rootScope', 'message',
        function ($stateParams, $scope, $uibModal, Entity, authService, searchService, $location, arachneSettings, $http, $window, $rootScope, message) {

            $rootScope.hideFooter = true;
            $scope.allow = true;

            var fullscreen = false;

            $scope.refreshImageIndex = function () {
                if ($scope.entity && $scope.entity.images) {
                    for (var i = 0; i < $scope.entity.images.length; i++) {
                        if ($scope.entity.images[i].imageId == $scope.imageId) {
                            $scope.imageIndex = i;
                            break;
                        }
                    }
                }
            };

            $scope.requestFullscreen = function () {
                var element = document.getElementById('theimage');
                // Find the right method, call on correct element

                if (fullscreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    fullscreen = false;
                } else {
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen();
                    } else if (element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    }
                    fullscreen = true;
                }
            };

            $scope.downloadImage = function () {
                var imgUri = arachneSettings.dataserviceUri + "/image/" + $scope.imageId;
                var entityUri = arachneSettings.dataserviceUri + "/entity/" + $scope.imageId;

                $http.get(imgUri, {responseType: 'blob'}).success(function (data) {

                    var blob = new Blob([data], {type: 'image/jpeg'});
                    var blobUri = $window.URL.createObjectURL(blob);

                    $http.get(entityUri).success(function (data) {

                        if (navigator.appVersion.toString().indexOf('.NET') > 0)
                            window.navigator.msSaveBlob(blob, data.title);
                        else {
                            var document = $window.document;
                            var a = document.createElement('a');
                            document.body.appendChild(a);
                            a.setAttribute('style', 'display:none');
                            a.href = blobUri;
                            a.download = data.title;
                            a.click();
                        }
                    });

                });
            };

            $scope.user = authService.getUser();
            $scope.currentQuery = searchService.currentQuery();
            $scope.entityId = $stateParams.entityId;
            $scope.imageId = $stateParams.imageId;
            Entity.get({id: $stateParams.entityId}, function (data) {

                $scope.entity = data;
                $scope.refreshImageIndex();
            }, function (response) {
                message.addMessageForCode("entity_" + response.status);
            });
            Entity.imageProperties({id: $scope.imageId}, function (data) {
                $scope.imageProperties = data;
                $scope.allow = true;
            }, function (response) {
                if (response.status == '403') {
                    $scope.allow = false;
                } else {
                    message.addMessageForCode('image_' + response.status);
                }
            });

            $scope.$watch("imageId", function () {
                $scope.refreshImageIndex();
            });

        }
    ])

    .controller('EntityImagesController', ['$stateParams', '$scope', 'Entity', '$filter', 'searchService', '$rootScope', 'message',
        function ($stateParams, $scope, Entity, $filter, searchService, $rootScope, message) {

            $rootScope.hideFooter = true;
            $scope.currentQuery = searchService.currentQuery();
            $scope.entityId = $stateParams.entityId;
            $scope.imageId = $stateParams.imageId;
            Entity.get({id: $stateParams.entityId}, function (data) {
                // call to filter detached from view in order to prevent unnecessary calls
                $scope.entity = data;
                $scope.cells = $filter('cellsFromImages')(data.images, data.entityId, $scope.currentQuery);
            }, function (response) {
                message.addMessageForCode("entity_" + response.status);
            });

        }
    ])

    .controller('StartSiteController', ['$rootScope', '$scope', '$http', 'arachneSettings', 'message',
        function ($rootScope, $scope, $http, arachneSettings, message) {

            $rootScope.hideFooter = false;

            $http.get('con10t/front.json').success(function (projectsMenu) {
                var projslides = $scope.projslides = [];
                for (var key in projectsMenu) {
                    projslides.push({
                        image: "con10t/frontimages/" + projectsMenu[key].id + ".jpg",
                        title: projectsMenu[key].text,
                        id: projectsMenu[key].id
                    });
                }
                $scope.active = Math.floor((Math.random() * $scope.projslides.length));
                
            });

            $http.get(arachneSettings.dataserviceUri + "/entity/count").success(function (data) {
                $scope.entityCount = data.entityCount;
            }).error(function (data) {
                message.addMessageForCode("backend_missing");
            });

        }
    ])

    .controller('AllCategoriesController', ['$rootScope', '$scope', '$http', 'categoryService', '$timeout',
        function ($rootScope, $scope, $http, categoryService, $timeout) {

            $rootScope.hideFooter = false;

            categoryService.getCategoriesAsync().then(function (categories) {
                $scope.categories = [];
                for (var key in categories) {
                    if (categories[key].status != 'none') {
                        $scope.categories.push(categories[key]);
                    }
                }
            });

        }
    ])
    .controller('ThreeDimensionalController', ['$scope', '$location', '$http', '$uibModal', 'arachneSettings', '$rootScope',
        function ($scope, $location, $http, $uibModal, arachneSettings, $rootScope) {

            $rootScope.hideFooter = true;
            $scope.backendUri = arachneSettings.dataserviceUri;

            this.showInfo = function () {

                if (!$scope.metainfos) {
                    $http.get(arachneSettings.dataserviceUri + "/model/" + $location.search().id + "?meta=true").success(function (data) {
                        $scope.metainfos = data;
                    });
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'partials/Modals/3dInfoModal.html',
                    scope: $scope
                });

                modalInstance.close = function () {
                    modalInstance.dismiss();
                }

            }
        }
    ])
    .controller('MessageController', ['$scope', 'message',
        function ($scope, message) {

            $scope.messages = message.getMessages();

            $scope.removeMessage = function (index) {
                message.removeMessage(index);
            }

        }
    ]);


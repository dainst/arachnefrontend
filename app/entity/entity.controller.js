export default function ($rootScope, $stateParams, searchService, $scope, Entity,
            $location, authService, categoryService, Query,
            messages, searchScope) {

    searchService.initQuery();

    $rootScope.tinyFooter = false;

    $scope.user = authService.getUser();
    $scope.serverUri = "http://" + document.location.host + document.getElementById('baseLink').getAttribute("href");

    categoryService.getCategoriesAsync().then(function (categories) {
        $scope.categories = categories;
    });

    $scope.currentQuery = searchService.currentQuery();

    //if id is not a number (=> string)
    if (isNaN($stateParams.id)) {
        var live = $location.search()["live"] == "true";
        var params;

        // TODO: Implement option to run page alias based query, currently not supported by the backend 
        // (Example: http://arachne.dainst.org/books/archive/A-VII-29/002 where "002" is the page alias.)
        // if(typeof $stateParams.page !== 'undefined') {
        //     params = {
        //         id: $stateParams.id,
        //         suffix: $stateParams.suffix,
        //         page: $stateParams.page,
        //         live: live
        //     };
        // } 
        // else if(typeof $stateParams.suffix !== 'undefined')
        if(typeof $stateParams.suffix !== 'undefined')
        {
            params = {
                id: $stateParams.id,
                suffix: $stateParams.suffix,
                live: live
            };
        } else{
            params = {
                id: $stateParams.id,
                live: live
            };
        }

        Entity.books(params, function (data) {
            $scope = data;

            if($scope.entityId == null) {
                $location.url('404');
            } else {
                $location.url('entity/' + $scope.entityId);
            }
        });
    }
    // if no id given, but query get id from search and reload
    else if (!$stateParams.id && $scope.currentQuery.hasOwnProperty('resultIndex')) {

        var resultIndex = parseInt($scope.currentQuery.resultIndex);
        searchService.getEntity(resultIndex).then(function (entity) {
            $location.url('/' + searchScope.currentScopePath() + 'entity/' + entity.entityId + $scope.currentQuery.toString());
            $location.replace();
        });
    } else {

        var live = $location.search()["live"] == "true";
        var lang = null;
        if(localStorage.lang)
            lang = localStorage.lang;
        Entity.get({id: $stateParams.id, live: live, lang: lang}, function (data) {

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

            if (data.lastModified) {
                $scope.entity.lastModified = new Date(data.lastModified).toISOString();
            } else {
                $scope.entity.lastModified = "";
            }

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

};

'use strict';

angular.module('arachne.widgets.directives')

.directive('con10tSearch', ['$location', '$filter', function($location, $filter) {
return {
    restrict: 'E',
    templateUrl: 'app/search/con10t-search.html',
    scope: {
        catalogId: '@',
        fq: '@',
        appendQuery: '@',
        scopeName: '@',
        searchPage: '@'
    },
    link: function(scope, element, attrs) {
        scope.placeholder = attrs.searchPlaceholder;
        scope.slashRegex  = /\//g;

        if(!scope.placeholder)
            scope.placeholder = $filter('transl8')('ui_projectsearchplaceholder');

        scope.search = function() {

            //  http://localhost:8082/project/syrher?lang=en%2Fsearch%3Fq%3D*  /search?q=*

			var url = '';
			console.log($location.url().split("?")[0])
			if (typeof scope.scopeName === "undefined") {
			    console.log($location.url().split("?")[0])
				url += $location.url().split("?")[0] + '/';
            } else {
			    url += 'project/' + scope.scopeName + '/';
            }

            url += (typeof scope.searchPage !== "undefined") ? scope.searchPage : 'search';

            url += "?q=";

			if(scope.catalogId != undefined && scope.catalogId != "")
                url += "catalogPaths:"+$filter('escapeSlashes')(scope.catalogId)+"+";

            if(scope.q != null && scope.q != "")
                url += scope.q;
            else
                url += "*";

            if (scope.appendQuery)
                url += " AND " + scope.appendQuery;

            if(scope.fq != undefined && scope.fq != "") {
                // split at every NOT escaped comma by replacing the comma with ETB, then split at every ETB
                var fqs = scope.fq.replace(/([^\\]),/g, '$1\u0017').split('\u0017');
                fqs.forEach(function(fq) {
                    var split = fq.split(':');
                    // remove backslash in front of escaped commas (de-escape)
                    url += '&fq='+split[0]+':"'+split[1].replace(/\\,/g, ',')+'"';
                });
            }
            $location.url(url);
        };
    }
}}]);
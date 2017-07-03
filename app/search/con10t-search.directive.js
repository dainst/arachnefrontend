'use strict';

angular.module('arachne.widgets.directives')

.directive('con10tSearch', ['$location', '$filter', function($location, $filter) {
return {
    restrict: 'E',
    templateUrl: 'app/search/con10t-search.html',
    scope: {
        catalogId: '@',
        fq: '@',
        appendQuery: '@'
    },
    link: function(scope, element, attrs) {
        scope.placeholder = attrs.searchPlaceholder;
        scope.slashRegex  = /\//g;

        if(!scope.placeholder)
            scope.placeholder = $filter('transl8')('ui_projectsearchplaceholder');

        scope.search = function() {


			var url = '';
			if (
                (typeof scope.catalogId === "undefined") &&
                (typeof scope.appendQuery === "undefined") &&
                (typeof scope.q === "undefined")
            ) {
				url += $location.url() + '/';
            }


            url += "search?q=";

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
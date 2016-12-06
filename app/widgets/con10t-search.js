'use strict';

angular.module('arachne.widgets.directives')

.directive('con10tSearch', ['$location', '$filter', function($location, $filter) {
return {
    restrict: 'E',
    templateUrl: 'app/widgets/con10t-search.html',
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
            var url = "search?q=";
            if(scope.catalogId != undefined && scope.catalogId != "")
                url += "catalogPaths:"+$filter('escapeSlashes')(scope.catalogId)+"+";

            if(scope.q != null && scope.q != "")
                url += scope.q;
            else
                url += "*";

            if (scope.appendQuery)
                url += " AND " + scope.appendQuery;

            if(scope.fq != undefined && scope.fq != "") {
                var fqs = scope.fq.split(',');
                fqs.forEach(function(fq) {
                    var split = fq.split(':');
                    url += '&fq='+split[0]+':"'+split[1]+'"';
                });
            }
            $location.url(url);
        };
    }
}}]);
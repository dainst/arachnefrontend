'use strict';

angular.module('arachne.widgets.directives')

.directive('con10tSearchCatalog', function() {
return {
    restrict: 'A',
    link: function(scope, element, attrs) {

        attrs.$observe('con10tSearchCatalog', function(value) {
            scope.q = "catalogPaths:" + value;
            updateHref();
        });

        attrs.$observe('con10tSearchFacet', function(value) {
            scope.fq = value;
            updateHref();
        });

        function updateHref() {
            var href = "http://arachne.dainst.org/search?q=" + scope.q;
            if (scope.fq) {
                var fqs = scope.fq.split(',');
                fqs.forEach(function(fq) {
                    var split = fq.split(':');
                    href += '&fq='+split[0]+':"'+split[1]+'"';
                });
            }
            element.attr("href", href);
        }

    }
}});
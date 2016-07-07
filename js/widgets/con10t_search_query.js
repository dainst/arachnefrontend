'use strict';

angular.module('arachne.widgets.directives')

.directive('con10tSearchQuery', function() {
return {
    restrict: 'A',
    link: function(scope, element, attrs) {

        attrs.$observe('con10tSearchQuery', function(value) {
            scope.q = value;
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
                    href += "&fq=" + fq;
                });
            }
            element.attr("href", href);
        }

    }
}});
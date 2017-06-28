'use strict';

angular.module('arachne.widgets.directives')

.directive('con10tSearchQuery', function() {
return {
    restrict: 'A',

    scope: {
        con10tSearchQuery: '@',
        con10tSearchFacet: '@'
    },

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
            var href = "/search?q=" + scope.q;
            if (scope.fq) {
                // split at every NOT escaped comma by replacing the comma with ETB, then split at every ETB
                var split, fqs = scope.fq.replace(/([^\\]),/g, '$1\u0017').split('\u0017');
                fqs.forEach(function(fq) {
                    split = fq.split(':');
                    // remove backslash in front of escaped commas
                    href += '&fq='+split[0]+':"'+split[1].replace(/\\,/g, ',')+'"';
                });
            }
            element.attr("href", href);
        }

    }
}});
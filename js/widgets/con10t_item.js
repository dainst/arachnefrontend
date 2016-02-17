'use strict';

angular.module('arachne.widgets.directives')
.directive('con10tItem', function() {
return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        attrs.$observe('con10tItem', function(value) {
            element.attr("href", "http://arachne.dainst.org/entity/" + value);
        });
    }
}});

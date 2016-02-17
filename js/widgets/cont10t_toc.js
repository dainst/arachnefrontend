'use strict';

angular.module('arachne.widgets.directives')

.directive('con10tToc', [ function () {
return {
    restrict: 'E',
    scope: {
        tocHeading: '@'
    },
    templateUrl: 'partials/widgets/con10t-toc.html',
    link: function(scope, element, attrs) {
        var headings = document.querySelectorAll(".con10t-toc-entry");

        scope.toc = [];

        for(var i = 0; i < headings.length; i++) {
            var headingID = headings[i].textContent.replace(/ /g, "_");
            var heading = {
                target: headingID,
                text: headings[i].textContent,
                depth: "con10t-toc-item level-" + headings[i].tagName.charAt(1)
            };
            headings[i].id = headingID;
            scope.toc.push(heading);
        }
    }
}}]);

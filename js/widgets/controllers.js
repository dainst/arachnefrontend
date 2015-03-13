'use strict';

/* Widget controllers */
angular.module('arachne.widgets.controllers', [])
    .controller('TocController', ['$scope', "$location", "arachneSettings", function($scope, $location, arachneSettings){
        $scope.toc = [];
        var headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

        for(var i = 0; i < headings.length; i++){
            var headingID = headings[i].innerHTML.replace(/ /g, "_");

            headings[i].setAttribute('id', headingID);

            var heading = {
                target: arachneSettings.serverUri + $location.path() + "#" + headingID,
                text: headings[i].innerHTML
            };

            $scope.toc.push(heading);
        }

        var tocElement = document.querySelector("con10t-toc");
        console.log(tocElement.getAttribute('toc-heading'));
        $scope.tocHeading = tocElement.getAttribute('toc-heading');

        var contentElement = tocElement.previousSibling;
    }])
;
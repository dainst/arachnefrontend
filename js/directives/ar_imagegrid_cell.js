'use strict';

angular.module('arachne.directives')

    .directive('arImagegridCell', ['$sce', function ($sce) {
        return {
            scope: {
                href: '@', img: '=', cellHighlighting: '@', cellTitle: '@', cellSubtitle: '@', cellLabel: '@', imgUri: '@',
                cellWidth: '@', imgWidth: '@', cellHeight: '@', cellMargin: '@', hideTitle: '@'
            },
            templateUrl: 'partials/directives/ar-imagegrid-cell.html'
        }
    }]);
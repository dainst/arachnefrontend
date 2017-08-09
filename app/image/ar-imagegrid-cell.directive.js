'use strict';

angular.module('arachne.directives')

    .directive('arImagegridCell', ['$sce', function ($sce) {
        return {
            scope: {
                href: '@', img: '=', cellHighlighting: '@', cellTitle: '@', cellSubtitle: '@', cellLabel: '@', imgUri: '@',
                cellWidth: '@', imgWidth: '@', cellHeight: '@', cellMargin: '@', hideTitle: '@', target: '@', searchScope: '@'
            },
            templateUrl: 'app/image/ar-imagegrid-cell.html'
        }
    }]);
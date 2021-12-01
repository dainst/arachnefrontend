'use strict';

angular.module('arachne.directives')

    .directive('arImagegridCell', ['$sce', function ($sce) {
        return {
            scope: {
                href: '@', img: '=', onClick: '=', cellHighlighting: '@', cellTitle: '@', cellSubtitle: '@', cellLabel: '@', imgUri: '@',
                cellWidth: '@', imgWidth: '@', cellHeight: '@', cellMargin: '@', hideTitle: '@', target: '@', searchScope: '@'
            },
            template: require('./ar-imagegrid-cell.html')
        }
    }]);

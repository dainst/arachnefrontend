'use strict';

angular.module('arachne.directives')

    .directive('arImagegrid', ['arachneSettings', '$http', '$sce', '$window', function (arachneSettings, $http, $sce, $window) {
        return {
            scope: {
                cells: '=',
                columns: '@',
                margin: '@',
                hideTitle: '@',
                complete: '=?'
            },
            templateUrl: 'partials/directives/ar-imagegrid.html',

            link: function (scope, element, attrs) {

                scope.loadImage = function (cell) {
                    cell.img = new Image();
                    cell.img.addEventListener("load", function () {
                        // custom event handlers need to be wrapped in $apply
                        scope.$apply(function () {
                            cell.complete = true;
                            scope.resizeRow(cell.row);
                        });
                    });
                    cell.img.addEventListener("error", function () {
                        scope.$apply(function () {
                            cell.complete = true;
                            cell.img = scope.placeholder;
                            scope.resizeRow(cell.row);
                        });
                    });
                    $http.get(cell.imgUri, {responseType: 'blob'})
                        .success(function (data) {
                            var blob = new Blob([data], {type: 'image/jpeg'});
                            cell.img.src = window.URL.createObjectURL(blob);
                        }).error(function (response) {
                        cell.img.src = scope.placeholder.src;
                    });
                };

                scope.resizeRow = function (row) {

                    // only resize if every cell in the row is complete
                    for (var i = 0; i < row.length; i++) {
                        if (!row[i].complete) return;
                    }

                    var imagesWidth = 0;
                    var maxHeight = 0;

                    for (var i = 0; i < row.length; i++) {
                        imagesWidth += row[i].img.naturalWidth;
                    }

                    var columns = scope.columns;
                    var totalWidth = element[0].clientWidth - 1;
                    totalWidth -= columns * scope.margin * 2;
                    // fill rows with fewer columns
                    if (row.length < columns) {
                        imagesWidth += (columns - row.length) * (totalWidth / columns)
                    }
                    var scalingFactor = totalWidth / imagesWidth;

                    for (var i = 0; i < row.length; i++) {
                        row[i].width = row[i].img.naturalWidth * scalingFactor;
                        if (scalingFactor > 1) {
                            row[i].imgWidth = row[i].img.naturalWidth;
                        } else {
                            row[i].imgWidth = row[i].width;
                        }
                        var height;
                        if (scalingFactor > 1) {
                            height = row[i].img.naturalHeight;
                        } else {
                            height = row[i].img.naturalHeight * scalingFactor;
                        }
                        if (height > maxHeight) maxHeight = height;
                    }

                    for (var i = 0; i < row.length; i++) {
                        row[i].height = maxHeight;
                    }

                    row.complete = true;
                    for (var i = 0; i < scope.grid.length; i++) {
                        if (!scope.grid[i].complete) {
                            scope.complete = false;
                            break;
                        } else {
                            scope.complete = true;
                        }
                    }

                };

                angular.element($window).bind('resize', function () {
                    scope.$apply(function () {
                        scope.complete = false;
                        for (var i = 0; i < scope.grid.length; i++) {
                            var row = scope.grid[i];
                            row.complete = false;
                            scope.resizeRow(row);
                        }
                    });
                });

            },

            controller: ['$scope', function ($scope) {

                $scope.placeholder = new Image();
                $scope.placeholder.src = 'img/imagePlaceholder.png';
                $scope.complete = false;

                $scope.$watch('cells', function (newCells, oldCells) {

                    if (typeof newCells == 'undefined' || !newCells) return;

                    var columns = $scope.columns;
                    var rows = Math.ceil($scope.cells.length / columns);
                    $scope.grid = new Array(rows);
                    for (var i = 0; i < rows; i++) {
                        $scope.grid[i] = new Array(columns);
                        for (var k = 0; k < columns; k++) {
                            if (i * columns + k >= $scope.cells.length) break;
                            var index = i * columns + k;
                            var cell = $scope.cells[index];
                            $scope.grid[i][k] = cell;
                            cell.row = $scope.grid[i];
                            $scope.grid[i].complete = false;
                            if (typeof cell.imgUri == 'undefined') {
                                cell.imgUri = $scope.placeholder.src;
                            }
                            $scope.loadImage(cell);
                        }
                    }

                });

            }]
        }
    }]);
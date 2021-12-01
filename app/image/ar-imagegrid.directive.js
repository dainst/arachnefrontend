'use strict';

angular.module('arachne.directives')

    .directive('arImagegrid', ['arachneSettings', '$http', '$sce', '$window', 'searchScope',
            function (arachneSettings, $http, $sce, $window, searchScope) {
        return {
            scope: {
                cells: '=',
                columns: '@',
                margin: '@',
                hideTitle: '@',
                complete: '=?',
                target: '@'
            },
            template: require('./ar-imagegrid.html'),

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
                            cell.img = scope.errorplaceholder;
                            scope.resizeRow(cell.row);
                        });
                    });
                    $http.get(cell.imgUri, {responseType: 'blob'})
                        .then(function (result) {

                            var data = result.data;
                            var blob = new Blob([data], {type: 'image/jpeg'});
                            cell.img.src = window.URL.createObjectURL(blob);
                        }).catch(function (response) {
                        cell.img.src = scope.errorplaceholder.src;
                    });
                };

                scope.resizeRow = function (row) {

                    var i, len;

                    len = row.length;

                    // only resize if every cell in the row is complete
                    for (i = 0; i < len; i++) {
                        if (!row[i].complete) return;
                    }

                    var imagesWidth = 0;
                    var maxHeight = 0;

                    for (i = 0; i < len; i++) {
                        imagesWidth += row[i].img.naturalWidth;
                    }

                    var columns = scope.columns;
                    var totalWidth = element[0].clientWidth - 1;
                    totalWidth -= columns * scope.margin * 2;

                    // fill rows with fewer columns
                    if (len < columns) {
                        imagesWidth += (columns - len) * (totalWidth / columns)
                    }
                    var scalingFactor = totalWidth / imagesWidth;

                    var currentRow;
                    for (i = 0; i < len; i++) {

                        currentRow = row[i];

                        currentRow.width = currentRow.img.naturalWidth * scalingFactor;
                        if (scalingFactor > 1) {
                            currentRow.imgWidth = currentRow.img.naturalWidth;
                        } else {
                            currentRow.imgWidth = currentRow.width;
                        }
                        var height;
                        if (scalingFactor > 1) {
                            height = currentRow.img.naturalHeight;
                        } else {
                            height = currentRow.img.naturalHeight * scalingFactor;
                        }
                        if (height > maxHeight) maxHeight = height;
                    }

                    for (i = 0; i < len; i++) {
                        row[i].height = maxHeight;
                    }

                    row.complete = true;
                    len = scope.grid.length;

                    for (i = 0; i < len; i++) {

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
                        var row, len = scope.grid.length;

                        for (var i = 0; i < len; i++) {

                            row = scope.grid[i];
                            row.complete = false;
                            scope.resizeRow(row);
                        }
                    });
                });


                scope.searchScopePath = searchScope.currentScopePath();

            },

            controller: ['$scope', function ($scope) {

                $scope.placeholder = new Image();
                $scope.placeholder.src = 'img/placeholder/placeholderNoImage.png';
                $scope.placeholderOrt = new Image();
                $scope.placeholderOrt.src = 'img/placeholder/placeholderOrt.png';
                $scope.placeholderLiteratur = new Image();
                $scope.placeholderLiteratur.src = 'img/placeholder/placeholderLiteratur.png';
                $scope.placeholderPerson = new Image();
                $scope.placeholderPerson.src = 'img/placeholder/placeholderPerson.png';
                $scope.placeholderGruppierung = new Image();
                $scope.placeholderGruppierung.src = 'img/placeholder/placeholderGruppierung.png';
                $scope.placeholder3D = new Image();
                $scope.placeholder3D.src = 'img/placeholder/placeholder3D.png';
                $scope.errorplaceholder = new Image();
                $scope.errorplaceholder.src = 'img/placeholder/placeholderError.png';
                $scope.complete = false;
                $scope.grid = [];

                $scope.$watchCollection('cells', function (newCells, oldCells) {

                    if (typeof newCells == 'undefined' || !newCells) return;

                    var column = 0;
                    var row = 0;

                    for (var i = 0; i < $scope.cells.length; i++) {

                        var cell = $scope.cells[i];
                        row = Math.floor(i / $scope.columns);
                        column = i % $scope.columns;
                        if (!$scope.grid[row]) $scope.grid[row] = [];
                        if ($scope.grid[row][column] == cell) continue;

                        $scope.grid[row][column] = cell;
                        cell.row = $scope.grid[row];
                        $scope.grid[row].complete = false;
                        if(typeof cell.imgUri == 'undefined') {
                            cell.imgUri = $scope.placeholder.src;
                        }
                        switch (cell.label) {
                            case 'Orte':
                                cell.imgUri = $scope.placeholderOrt.src;
                                break;
                            case 'Literatur':
                                cell.imgUri = $scope.placeholderLiteratur.src;
                                break;
                            case 'Personen':
                                cell.imgUri = $scope.placeholderPerson.src;
                                break;
                            case 'Gruppierungen':
                                cell.imgUri = $scope.placeholderGruppierung.src;
                                break;
                            case '3D-Modelle':
                                cell.imgUri = $scope.placeholder3D.src;
                                break;
                            default:
                                break;
                        }
                        $scope.loadImage(cell);

                    }
                    $scope.grid.length = row + 1;
                    $scope.grid[row].length = column + 1;

                });
            }]
        }
    }]);

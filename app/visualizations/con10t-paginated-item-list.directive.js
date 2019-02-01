'use strict';

angular.module('arachne.visualizations.directives')
    .directive('con10tPaginatedItemList', ['$filter', function ($filter) {
        return {
            restrict: 'E',
            templateUrl: 'app/visualizations/con10t-paginated-item-list.html',
            scope: {
                heading: '@',
                itemsPerPage: '@',
                itemList: '=',
                selected: '='
            },
            link: function (scope, element, attrs) {

                scope.offset = 0;
                scope.ipp = parseInt(scope.itemsPerPage);
                scope.orderType = 2;
                scope.orderGlyph = 'glyphicon-sort-by-order-alt';

                scope.increaseOffset = function(){
                    if(scope.offset + scope.ipp < scope.itemList.length - scope.ipp){
                        scope.offset += scope.ipp;
                    } else {
                        scope.offset = scope.itemList.length - scope.ipp;
                    }
                };

                scope.decreaseOffset = function(){
                    if(scope.offset - scope.ipp >= 0){
                        scope.offset -= scope.ipp;
                    } else {
                        scope.offset = 0
                    }
                };

                scope.toggleItem = function(id){
                    var index = scope.selected.indexOf(id);
                    if(index >= 0){
                        scope.selected.splice(index, 1);
                    } else {
                        scope.selected.push(id)
                    }
                };

                scope.updateDisplayedList = function(){

                    if(typeof scope.itemList === 'undefined'){
                        return;
                    }

                    if(scope.orderType === 0) {
                        scope.orderGlyph = 'glyphicon-sort-by-alphabet';
                        scope.itemList.sort(function (a, b) {
                            return a[1].toLowerCase() > b[1].toLowerCase()
                        });
                    } else if(scope.orderType === 1){
                        scope.orderGlyph = 'glyphicon-sort-by-alphabet-alt';
                        scope.itemList.sort(function (a, b) {
                            return a[1].toLowerCase() < b[1].toLowerCase()
                        });
                    } else if(scope.orderType === 2){
                        scope.orderGlyph =  'glyphicon-sort-by-order-alt';
                        scope.itemList.sort(function(a, b){
                            return a[2] < b[2];
                        });
                    } else {
                        scope.orderGlyph = 'glyphicon-sort-by-order';
                        scope.itemList.sort(function(a, b){
                            return a[2] > b[2];
                        });
                    }
                };

                scope.toggleListOrder = function(){
                    scope.orderType = (scope.orderType + 1) % 4;
                    scope.updateDisplayedList();
                };

                scope.deselectAll = function(){
                    scope.selected = [];
                };

                scope.selectAll = function(){
                    scope.selected = [];
                    for(var key in scope.itemList){
                        scope.selected.push(scope.itemList[key][0]);
                    }
                };

                scope.$watch('itemList', function(newValue, oldValue){
                    scope.updateDisplayedList();
                    scope.offset = 0;
                });

            }
        }
    }]);
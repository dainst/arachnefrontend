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
                scope.itemFilter = '';

                scope.increaseOffset = function(){
                    if(scope.offset + scope.ipp < scope.displayedList.length - scope.ipp){
                        scope.offset += scope.ipp;
                    } else {
                        scope.offset = scope.displayedList.length - scope.ipp;
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
                    scope.displayedList = angular.copy(scope.itemList);

                    if(scope.orderType === 0) {
                        scope.orderGlyph = 'glyphicon-sort-by-alphabet';
                        scope.displayedList.sort(function (a, b) {
                            return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
                        });
                    } else if(scope.orderType === 1){
                        scope.orderGlyph = 'glyphicon-sort-by-alphabet-alt';
                        scope.displayedList.sort(function (a, b) {
                            return a.label.toLowerCase() > b.label.toLowerCase() ? -1 : 1;
                        });
                    } else if(scope.orderType === 2){
                        scope.orderGlyph =  'glyphicon-sort-by-order-alt';
                        scope.displayedList.sort(function(a, b){
                            return  b.count - a.count;
                        });
                    } else {
                        scope.orderGlyph = 'glyphicon-sort-by-order';
                        scope.displayedList.sort(function (a, b) {
                            return a.count - b.count;
                        });
                    }

                    scope.displayedList = scope.displayedList.filter(function(a){
                        return a.label.toLowerCase().includes(scope.itemFilter.toLowerCase())
                    });

                    if(scope.offset > scope.displayedList.length){
                        scope.offset = (scope.displayedList.length - scope.ipp < 0) ? 0 : scope.displayedList.length - scope.ipp;
                    }

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
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
                    for(var key in scope.displayedList){
                        scope.selected.push(scope.displayedList[key].id);
                    }
                };

                scope.$watch('itemList', function(newValue, oldValue){
                    scope.updateDisplayedList();
                }, true);
            }
        }
    }]);
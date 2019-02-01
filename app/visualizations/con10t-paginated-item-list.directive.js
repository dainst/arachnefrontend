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

                    if(!scope.$root.$$phase && !scope.$$phase) {
                        scope.$apply();
                    }
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
                    scope.offset = 0;
                });
            }
        }
    }]);
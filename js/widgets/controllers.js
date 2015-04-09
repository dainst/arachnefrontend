'use strict';

/* Widget controllers */
angular.module('arachne.widgets.controllers', [])
   .controller('CatalogController', ['$scope', "catalogService", '$filter', function($scope, catalogService, $filter){
      var catalogElement = document.querySelector("con10t-catalog");
      var slashRegex = /\//g;

      $scope.catalog = catalogService.getCatalog(catalogElement.getAttribute('catalog'));
      $scope.isShown = new Map();
      $scope.i18n = $filter.i18n;
      $scope.escapePath = function(path){
         return path.replace(slashRegex, '\\/');
      };
      $scope.toggleCollapse = function(label){
         $scope.isShown.set(label, !($scope.isShown.get(label)));
      };
      $scope.checkIfShown = function(label){
         return $scope.isShown.get(label); // at first load -> undefined, so it gets hidden but: ugly?
      };
    }]);
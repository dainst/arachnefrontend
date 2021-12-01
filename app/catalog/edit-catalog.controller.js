export default function ($scope, catalog) {
    $scope.catalog = catalog;
    $scope.edit = catalog.hasOwnProperty("public");
};

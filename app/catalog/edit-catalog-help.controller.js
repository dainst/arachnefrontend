export default function ($scope) {
    $scope.currentPage = 0;
    $scope.totalPages = 9;

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages - 1) {
            $scope.currentPage++;
        }
    };

    $scope.previousPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };
};

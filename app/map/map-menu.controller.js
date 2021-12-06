export default function($scope, searchService) {

    $scope.leftMenuToggled = true;
    $scope.rightMenuToggled = true;

    $scope.overlaysActive = function () {
        return (searchService.currentQuery().overlays ? true : false);
    }
};

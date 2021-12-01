export default function ($scope, Entity, entry) {
    $scope.entry = entry;
    $scope.edit = true;
    if ($scope.entry.arachneEntityId) {
        $scope.entity = Entity.get({id:$scope.entry.arachneEntityId});
    }
};

/**
 * Handles the layout for viewing available catalogs.
 *
 * @author: Sebastian Cuy, Oliver Bensch, Thomas Kleinke
 */
export default function ($scope, $uibModal, $location,
        authService, Entity, Catalog, CatalogEntry, $http, arachneSettings, messages) {

    $scope.refreshCatalogs = function(){
        $scope.loading++;
        Catalog.query({}, function(result) {
            $scope.loading--;
            $scope.catalogs = result;
        });
    };

    $scope.createCatalog = function() {

        var catalogBuffer = { author: $scope.user.username };

        if ($scope.user.firstname && $scope.user.lastname) {
            catalogBuffer.author = $scope.user.firstname + " " + $scope.user.lastname;
        }

        var editCatalogModal = $uibModal.open({
            template: require('./edit-catalog.html'),
            controller: 'EditCatalogController',
            resolve: { catalog: function() { return catalogBuffer }, edit: false }
        });

        editCatalogModal.close = function(newCatalog) {
            if(!newCatalog.projectId)
                newCatalog.projectId = "";
            newCatalog.public = false;
            Catalog.save({}, newCatalog, function(result) {
                $scope.catalogs.push(result);
                $scope.activeCatalog = result;
                editCatalogModal.dismiss();
            }, function() {
                messages.add('default');
            });
        };

    };

    $scope.user = authService.getUser();
    if ($scope.user === undefined) {
        $location.url('login?redirectTo=catalogs');
        return false;
    }

    $scope.catalogs = [];
    $scope.entryMap = {};

    var url = arachneSettings.dataserviceUri + '/userinfo/' + $scope.user.username;
    $http.get(url)
        .then(function(result) {
        $scope.user = result.data;
    });

    $scope.loading = 0;

    $scope.refreshCatalogs();

};

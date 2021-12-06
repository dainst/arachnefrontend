export default function(searchService, authService, $uibModal, $location, mapService) {

    return {
        template: require('./ar-map-nav.html'),
        link: function(scope) {

            scope.$watch(function() {
                scope.resultSize = searchService.getSize();
                scope.currentQuery = searchService.currentQuery();
                scope.user = authService.getUser();
            });


            // renders a modal that contains a link to the current map's view
            scope.showLinkModal = function () {
                // construct the link's reference from the current location and the map's query
                var host = $location.host();
                var port = $location.port();
                port = (port === 80) ? "" : ":" + port;
                var baseLinkRef = document.getElementById('baseLink').getAttribute("href");
                var path = $location.path().substring(1);

                var query = mapService.getMapQuery(searchService.currentQuery()).toString();

                scope.linkText = host + port + baseLinkRef + path + query;

                var modalInstance = $uibModal.open({
                    template: require('./map-link-modal.html'),
                    scope: scope
                });

                modalInstance.close = function () {
                    modalInstance.dismiss();
                };

                // Select and focus the link after the modal rendered
                modalInstance.rendered.then(function(what) {
                    var elem = document.getElementById('link-display');
                    elem.setSelectionRange(0, elem.firstChild.length);
                    elem.focus();
                })
            };

            scope.openDownloadDialog = function () {
                var modalInstance = $uibModal.open({
                    template: require('../export/download-modal.html'),
                    controller: 'DownloadController'
                });

                modalInstance.result.then(function () {
                    $window.location.reload();
                });
            };

            scope.stripQuery = function(query, view) {
                if (view) {
                    query = query.setParam('view', view);
                } else {
                    query = query.removeParam('view');
                }

                return query
                    .removeParam('fl')
                    .removeParam('lat')
                    .removeParam('lng')
                    .removeParam('zoom')
                    .toString();
            }

        }
    }
};

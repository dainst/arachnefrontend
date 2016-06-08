angular.module('arachne.filters')

    .filter('cellsFromImages', ['arachneSettings', function (arachneSettings) {
        return function (images, entityId, currentQuery) {
            for (var i in images) {
                images[i].href = 'entity/' + entityId + "/image/" + images[i].imageId + currentQuery.toString();
                images[i].imgUri = arachneSettings.dataserviceUri + "/image/height/" + images[i].imageId + "?height=300";
                images[i].title = images[i].imageSubtitle;
            }
            return images;
        }
    }]);
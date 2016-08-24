angular.module('arachne.filters')

    .filter('cellsFromEntities', ['arachneSettings', 'categoryService', function (arachneSettings, categoryService) {
        return function (entities, query) {

            for (var i in entities) {

                var currentEntity = entities[i];
                
                currentEntity.label = categoryService.getSingular(currentEntity.type);
                currentEntity.href = 'entity/' + currentEntity.entityId;

                if (typeof query != 'undefined') {
                    currentEntity.href += query.setParam("resultIndex", (parseInt(query.offset) + parseInt(i) + 1)).toString();
                }
                if (typeof currentEntity.thumbnailId != 'undefined') {
                    currentEntity.imgUri = arachneSettings.dataserviceUri + "/image/height/" + currentEntity.thumbnailId + "?height=300";
                }

                if (typeof currentEntity.highlights != 'undefined') {

                    var highlights = [];
                    for (var highlightedField in currentEntity.highlights) {

                        if (highlightedField === "subtitle" || highlightedField === "title") {
                            currentEntity[highlightedField] = currentEntity.highlights[highlightedField].join('...')
                        } else {
                            highlights.push(currentEntity.highlights[highlightedField].join('...<hr>'))
                        }
                    }
                    currentEntity.highlighting = highlights.join(', ');
                }
            }
            return entities;
        }
    }]);
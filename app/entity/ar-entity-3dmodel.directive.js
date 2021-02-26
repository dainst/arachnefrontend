'use strict';

angular.module('arachne.directives')

    .directive('arEntity3dmodel', ['arachneSettings', function(arachneSettings) {
        return {
            link: function(scope) {

                const getFirstObjModel = (entity) => 
                    entity.models && entity.models.find(model => /(\.obj)$/.test(model.fileName));
                
                const getFirst3dhopModel = (entity) => 
                    entity.models && entity.models.find(model => /(\.nxz|\.ply)$/.test(model.fileName));
                
                scope.showObjViewer = () => scope.entity && getFirstObjModel(scope.entity);

                scope.getObjViewerUrl = () => {
                    if (!scope.entity) return;
                    const model = getFirstObjModel(scope.entity);
                    return '3dviewer/thumb.html?modelId=' + model.internalId + '&backendUri=' + arachneSettings.dataserviceUri;
                }

                scope.show3DHOP = () => scope.entity && getFirst3dhopModel(scope.entity);

                scope.get3DHOPViewerUrl = () => {
                    if (!scope.entity) return;
                    const model = getFirst3dhopModel(scope.entity);
                    return '3dhop/thumb.html?model=/data/model/' + model.internalId + model.fileName.substr(-4);
                }
            },
            scope: { entity: '=' },
            replace: true,
            templateUrl: 'app/entity/ar-entity-3dmodel.html'
        }
    }]);

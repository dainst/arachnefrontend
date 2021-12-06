import DownloadController from './download.controller.js';

export default angular.module('arachne.export', [])
    .controller('DownloadController', ['$scope', '$uibModalInstance', '$http', '$filter', 'arachneSettings', 'downloadUrl', 'downloadParams', 'transl8', 'language', DownloadController])
;

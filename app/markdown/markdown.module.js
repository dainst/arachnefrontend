import AddMarkdownLinkController from './add-markdown-link.controller.js';
import arMarkdownTextEditor from './ar-markdown-text-editor.directive.js';

export default angular.module('arachne.markdown', [])
    .controller('AddMarkdownLinkController', ['$scope', 'link', AddMarkdownLinkController])
    .directive('arMarkdownTextEditor', ['$timeout', '$uibModal', arMarkdownTextEditor])
;

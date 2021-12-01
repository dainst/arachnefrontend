import { _3dviewer } from 'idai-3dviewer';

export default function () {
    return {

        restrict: 'A',
        scope: { options: '=' },

        link: function (scope, element, attrs) {

            var init = function() {
                _3dviewer(scope.options);
            };

            init();
        }
    }
};

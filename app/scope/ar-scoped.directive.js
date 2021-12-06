export default function (searchScope) {

    return {
        restrict: 'A',
        scope: {
            arScopedHref: '@'
        },
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                attrs.$set('href', searchScope.currentScopePath() + scope.arScopedHref);
            });
        }
    }

};

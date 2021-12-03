/**
 * @author: Jan G. Wieners
 */
export default function() {
    return {
        restrict: 'E',
        scope: {
            src: '@',
            alt: '@',
            align: '@',
            width: '@',
            height: '@',
            entityId: '@'
        },
        transclude: true,
        template: require('./con10t-image.html'),

        link: function(scope, element, attrs, ctrl, $transclude) {

            $transclude(function(clone){
                scope.showCaption = clone.length;
            });
        }
    }
};

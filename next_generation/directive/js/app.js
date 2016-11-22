/**
 * Created by kelvin on 16/11/19.
 */
angular.module('app', []).directive('ngbkFocus', function () {
    return {
        link: function (scope, elements, attrs, controller) {
            elements[0].focus();
        }
    };
}).controller('IndexCtrl', function ($scope) {
    $scope.message = {text: 'nothing clicked yet'};
    $scope.clickUnfocused = function () {
        $scope.message.text = 'unfocused button clicked';
    };
    $scope.clickFocused = function () {
        $scope.message.text = 'focus button clicked';
    };
});
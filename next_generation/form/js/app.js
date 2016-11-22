/**
 * Created by kelvin on 16/11/19.
 */
angular.module('app', []).controller('AddUserController', function ($scope) {
    $scope.message = '';
    $scope.addUser = function () {
    // TODO for the reader: actually save user to database...
    $scope.message = 'Thanks, ' + $scope.user.first + ', we added you!';
    };
});
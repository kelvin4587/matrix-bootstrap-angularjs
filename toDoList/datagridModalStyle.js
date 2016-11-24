/**
 * Created by kelvin on 16/11/6.
 */
angular.module('datagrid', ['ui.bootstrap'])
    .controller('dataGridCtrl', function ($scope, $http, $modal, $log) {
        var futureResponse = $http.get('toDoList/data.json');
        futureResponse.success(function (data, status, headersL, config) {
            $scope.menus = data;
            $scope.pageNo = 0;
        });
        futureResponse.error(function (data, status, headers, config) {
            throw new Error('Something went wrong...');
        });
        $scope.allChecked = false;
        function checkAllOrNo(allOrNO) {
            $scope.allChecked = allOrNO;
            for (var i = 0; i < $scope.menus.length; i++) {
                $scope.menus[i].checked = allOrNO;
            }
        }

        $scope.checkAll = function () {
            if (!$scope.allChecked) {
                checkAllOrNo(true);
            } else {
                checkAllOrNo(false);
            }
        };
        $scope.dateOptions = {
            'day-title-format': "'yyyy年MM月'"
        };
        $scope.showMenuDetail = function (menu) {
            $scope.showMenu = menu;
        };
        function addMenu() {
            var clonedMenu = angular.copy($scope.editMenu);
            $scope.menus.push(clonedMenu);
        };
        $scope.options = [
            {name: '一层', value: 1},
            {name: '两层', value: 2},
            {name: '三层', value: 3},
            {name: '四层', value: 4}];
        $scope.editMenu = {};
        $scope.openDialog = function (method, menu) {
            var templateName;
            if (method) {
                if (method == 'add') {
                    clearEditForm();
                }
                templateName = method + 'ContentModalStyle.html';
            } else {
                templateName = 'viewContent.html';
            }
            if (menu) {
                var clonedMenu = angular.copy(menu);
                $scope.editMenu = clonedMenu;
            }
            var modalInstance = $modal.open({
                templateUrl: templateName,
                controller: ModalInstanceCtrl,
                resolve: {
                    options: function () {
                        return $scope.options;
                    },
                    editMenu: function () {
                        return $scope.editMenu;
                    },
                    dateOptions: function () {
                        return $scope.dateOptions;
                    }

                }
            });
            modalInstance.result.then(function (editMenu) {
                addMenu(editMenu);
                $log.info('Modal ok at: ' + new Date());
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        $scope.deleteDialog = function () {
            var modalInstance = $modal.open({
                templateUrl: 'deleteConfirm.html',
                controller: confirmModalCtrl
            });
            modalInstance.result.then(function () {
                deleteMenus();
            }, function () {

            });
        };
        var ModalInstanceCtrl = function ($scope, $modalInstance, options, editMenu, dateOptions) {
            $scope.options = options;
            $scope.editMenu = editMenu;
            $scope.dateOptions = dateOptions;
            $scope.canSave = function () {
                if ($scope.editMenu.menuName == '') {
                    return false;
                } else if ($scope.editMenu.menuName) {
                    return true;
                } else {
                    return false;
                }
            };
            $scope.showError = function () {
                if ($scope.editMenu.menuName == '') {
                    return true;
                } else if ($scope.editMenu.menuName) {
                    return false;
                } else {
                    return true;
                }
            };
            $scope.ok = function () {
                $modalInstance.close($scope.editMenu);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
        var confirmModalCtrl = function ($scope, $modalInstance) {
            $scope.ok = function () {
                $modalInstance.close($scope.editMenu);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        function clearEditForm() {
            $scope.editMenu.level = '';
            $scope.editMenu.menuName = '';
            $scope.editMenu.createDate = '';
            $scope.editMenu.type = '';
            $scope.editMenu.position = {"head": false, "left": false, "footer": false};
        }

        function deleteMenus() {
            for (var i = 0; i < $scope.menus.length; i++) {
                if ($scope.menus[i].checked) {
                    $scope.menus.splice(i, 1);
                }
            }
        }

        //pagination
        $scope.pageSize = 3;
        $scope.pages = [];
        $scope.$watch('filteredMenus.length', function (filteredSize) {
            $scope.pages.length = 0;
            var noOfPages = Math.ceil(filteredSize / $scope.pageSize);
            for (var i = 0; i < noOfPages; i++) {
                $scope.pages.push(i);
            }
        });
        $scope.setActivePage = function (pageNo) {
            if (pageNo >= 0 && pageNo < $scope.pages.length) {
                $scope.pageNo = pageNo;
            }
        };
        $scope.nextActivePage = function () {
            if ($scope.pageNo != ($scope.pages.length - 1)) $scope.pageNo = $scope.pageNo + 1;
        };
        $scope.previousActivePage = function () {
            if ($scope.pageNo != 0) $scope.pageNo = $scope.pageNo - 1;
        };
    })
    .filter('pagination', function () {
        return function (inputArray, selectedPage, pageSize) {
            var start = selectedPage * pageSize;
            return inputArray.slice(start, start + pageSize);
        };
    })
    .filter('parentOrChild', function () {
        return function (input) {
            if (input) {
                return input == 1 ? '父菜单' : input != 2 ? '' : '在菜单';
            } else {
                return input;
            }
        };
    }).filter('level', function () {
    return function (input) {
        var result = '';
        switch (input) {
            case '1':
                result = '一层';
                break;
            case '2':
                result = '两层';
                break;
            case '3':
                result = '三层';
                break;
            case '4':
                result = '四层';
                break;
            default:
                result = input;
        }
        return result;
    };
});

angular.module('routing_basics', ['ui.bootstrap'])

    .config(function ($routeProvider) {

        $routeProvider
            .when('/admin/menus/list', {templateUrl: 'router2/tpls/menus/list.html'})
            .when('/admin/menus/new', {templateUrl: 'router2/tpls/menus/new.html'})
            .otherwise({redirectTo: '/admin/menus/list'});
    })

    .factory('Menus', function ($http) {
        var menus = [];
        var showTabFlag = false;
        $http.get('toDoList/data.json').then(function (response) {
            menus = response.data
        }, function () {
            throw new Error('something goes wrong')
        });
        return {
            query: function () {
                return menus;
            },
            add: function (menu) {
                return menus.push(menu);
            },
            get: function (id) {
                return menus[id];
            },
            update: function (id, menu) {
                menus[id] = menu;
            },
            showTab: function () {
                showTabFlag = true;
                return showTabFlag;
            },
            hideTab: function () {
                showTabFlag = false;
                return showTabFlag;
            },
            getTabFlag: function () {
                return showTabFlag;
            }
        };
    })
    .controller('NavigationCtrl', function ($scope, $location, Menus) {
        $location.path('/admin/menus/list');
        $scope.showTabFlag=function() {
            return Menus.getTabFlag();
        };
    })
    .controller('ListMenusCtrl', function ($scope, $location, $modal, Menus) {
        $scope.menus = Menus.query();
        $scope.pageNo = 0;
        $scope.allChecked = false;
        $scope.newTab = function () {
            Menus.showTab();
            $location.path('/admin/menus/new');
        };
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

        $scope.openDialog = function (menu) {
            $scope.editMenu = menu;
            var modalInstance = $modal.open({
                templateUrl: 'viewContent.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    editMenu: function () {
                        return $scope.editMenu;
                    },
                    options: function () {
                        return $scope.options;
                    }
                }
            });
            modalInstance.result.then(function () {
                $log.info('Modal ok at: ' + new Date());
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        var ModalInstanceCtrl = function ($scope, $modalInstance, options, editMenu) {
            $scope.options = options;
            $scope.editMenu = editMenu;
            $scope.dateOptions = {
                'day-title-format': "'yyyy年MM月'"
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
        $scope.options = [
            {name: '一层', value: 1},
            {name: '两层', value: 2},
            {name: '三层', value: 3},
            {name: '四层', value: 4}];
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
        var confirmModalCtrl = function ($scope, $modalInstance) {
            $scope.ok = function () {
                $modalInstance.close($scope.editMenu);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        function deleteMenus() {
            for (var i = 0; i < $scope.menus.length; i++) {
                if ($scope.menus[i].checked) {
                    $scope.menus.splice(i, 1);
                }
            }
        }

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
    }).filter('pagination', function () {
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
    })
    .filter('level', function () {
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
    })
    .controller('NewMenuCtrl', function ($scope, $location, Menus) {
        function init() {
            var menu = {}
            menu.level = '';
            menu.menuName = '';
            menu.createDate = '';
            menu.type = '';
            menu.position = {"head": false, "left": false, "footer": false};
            return menu;
        }

        $scope.editMenu = init();
        $scope.clearForm = function () {
            $scope.editMenu = init();
        };
        $scope.options = [
            {name: '一层', value: 1},
            {name: '两层', value: 2},
            {name: '三层', value: 3},
            {name: '四层', value: 4}];
        $scope.dateOptions = {
            'day-title-format': "'yyyy年MM月'"
        };
        $scope.newMenu = function () {
            var clonedMenu = angular.copy($scope.editMenu);
            Menus.add(clonedMenu);
            $location.path('/admin/menus/list');
            Menus.hideTab();
        };
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
    });

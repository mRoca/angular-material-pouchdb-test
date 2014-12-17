'use strict';

angular.module('myApp.layout', ['ngMaterial'])
    .factory('layoutService', function () {
        var layoutService = {};

        var addButtonAction = null;
        var addButtonScopesWatcher = [];

        layoutService.addButton = {
            setAction: function (callback) {
                addButtonAction = callback;
                this.emit();
            },
            clear: function () {
                addButtonAction = null;
                this.emit();
            },
            subscribe: function (scope, localVar) {
                addButtonScopesWatcher.push([scope, localVar || 'addButtonAction']);
            },
            emit: function () {
                angular.forEach(addButtonScopesWatcher, function (scope) {
                    scope[0][scope[1]] = addButtonAction;
                });
            }
        };

        return layoutService;
    })
    .controller('ToolbarCtrl', ['$scope', '$mdSidenav', function ($scope, $mdSidenav) {
        $scope.toggleLeft = function () {
            $mdSidenav('left').toggle();
        };
    }])
    .controller('SidebarMenuCtrl', ['$scope', '$location', '$mdSidenav', function ($scope, $location, $mdSidenav) {

        $scope.currentPath = $location.path();

        $scope.$on('$routeChangeSuccess', function (next, last, t) {
            $scope.currentPath = $location.path();
        });

        $scope.close = function () {
            $mdSidenav('left').close();
        };
    }])
    .controller('AddButton', ['$scope', 'layoutService', function ($scope, layoutService) {
        $scope.addButtonAction = null;
        layoutService.addButton.subscribe($scope);
    }])
;

'use strict';

angular.module('myApp.layout', ['ngMaterial'])

    .controller('ToolbarCtrl', ['$scope', '$mdSidenav', function ($scope, $mdSidenav) {
        $scope.toggleLeft = function () {
            $mdSidenav('left').toggle();
        };
    }])
    .controller('SidebarMenuCtrl', ['$scope', '$mdSidenav', function ($scope, $mdSidenav) {
        $scope.close = function () {
            $mdSidenav('left').close();
        };
    }])
;

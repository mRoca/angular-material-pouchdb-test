'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.layout'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope', '$mdDialog', 'layoutService', function ($scope, $mdDialog, layoutService) {
        $scope.todos = [
            {
                face: 'HTTP',
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: 'HTTP',
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            }
        ];

        $scope.selectedIndex = null;

        $scope.showTodo = function (e, index, item) {
            $scope.selectedIndex = index;

            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'view1/item.dialog.html',
                targetEvent: e,
                locals: {item: item}
                //bindToController: false
            })
                .then(function (updatedItem) {
                    if (item) {
                        angular.extend(item, updatedItem);
                    } else {
                        $scope.todos.push(updatedItem);
                    }

                    $scope.selectedIndex = null;
                }, function () {
                    $scope.selectedIndex = null;
                });
        };

        layoutService.addButton.setAction($scope.showTodo);

        $scope.$on("$destroy", function () {
            layoutService.addButton.clear();
        });
    }]);

function DialogController($scope, $mdDialog, item) {
    $scope.item = item ? angular.copy(item) : {};

    $scope.save = function () {
        $mdDialog.hide($scope.item);
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
}

'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
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
            },
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
            },
            {
                face: 'HTTP',
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            }
        ];

        $scope.showTodo = function (e, item) {
            console.log(item);

            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'view1/item.dialog.html',
                targetEvent: e,
                locals: {item: item}
                //bindToController: true
            })
                .then(function (answer) {
                    $scope.alert = 'You said the information was "' + answer + '".';
                    console.log($scope.alert);

                }, function () {
                    $scope.alert = 'You cancelled the dialog.';
                    console.log($scope.alert );
                });
        };
    }]);

function DialogController($scope, $mdDialog, item) {

    $scope.item = item;

    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.answer = function (answer) {
        $mdDialog.hide(answer);
    };
}

'use strict';

angular.module('myApp.view2', ['ngRoute', 'pouchdb', 'crypto'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', 'pouchdb', 'crypto', function ($scope, pouchdb, crypto) {

        console.log('crypto', crypto);
        console.log(crypto.encrypt('test'));
        console.log(crypto.decrypt(crypto.encrypt('test')));

        $scope.books = pouchdb.createCollection('bookstmp', true);

        console.log('db', $scope.books.$db);


        $scope.online = true;
        $scope.toggleOnline = function () {
            $scope.online = !$scope.online;

            if ($scope.online) {
                $scope.books.$db.sync();
            }
        };
    }])
;

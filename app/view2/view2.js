'use strict';

angular.module('myApp.view2', ['ngRoute', 'pouchdb'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', 'pouchdb', function ($scope, pouchdb) {
        $scope.books = pouchdb.createCollection('books');
        $scope.online = false;
        $scope.toggleOnline = function () {
            $scope.online = !$scope.online;

            if ($scope.online) {

                //$scope.sync = $scope.books.$db.replicate.sync(result.db, {live: true})
                $scope.sync = $scope.books.$db.replicate.sync('http://localhost:5984/books', {live: true})
                    .on('error', function (err) {
                        $scope.online = false;
                        console.log("Syncing stopped", err);
                    });
            }
        };

        $scope.toggleOnline();
    }])
;

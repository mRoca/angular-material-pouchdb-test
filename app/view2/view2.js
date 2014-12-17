'use strict';

angular.module('myApp.view2', ['ngRoute', 'pouchdb'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', 'pouchCollection', 'pouchBindingSimple', function ($scope, pouchCollection, pouchBindingSimple) {
        $scope.books = pouchCollection('books');

        $scope.online = false;
        $scope.toggleOnline = function () {
            $scope.online = !$scope.online;

            if ($scope.online) {  // Read http://pouchdb.com/api.html#sync
                $scope.sync = $scope.books.$db.replicate.sync('http://localhost:5984/books', {live: true})
                    .on('error', function (err) {
                        console.log("Syncing stopped");
                        $scope.online = false;
                        console.log(err);
                    });
            } else {
                $scope.sync.cancel();
            }
        };

        $scope.toggleOnline();
    }])
;

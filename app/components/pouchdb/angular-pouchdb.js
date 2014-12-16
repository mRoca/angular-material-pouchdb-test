/*
 Based on https://github.com/wspringer/angular-pouchdb under MIT License
 Copyright (c) 2013-2014 Wilfred Springer, http://nxt.flotsam.nl/
 */

(function () {
    var pouchdb, slice;

    pouchdb = angular.module('pouchdb', ['ng']);

    slice = Array.prototype.slice;

    pouchdb.provider('pouchdb', function () {
        return {
            withAllDbsEnabled: function () {
                return PouchDB.enableAllDbs = true;
            },
            $get: [
                '$q', '$rootScope', '$timeout', function ($q, $rootScope, $timeout) {
                    var qify;
                    qify = function (fn) {
                        return function () {
                            var args, deferred;
                            deferred = $q.defer();
                            args = arguments != null ? slice.call(arguments) : [];
                            fn.apply(this, args).then(function (res) {
                                $rootScope.$evalAsync(function () {
                                    return deferred.resolve(res);
                                });
                                return $rootScope.$apply();
                            })["catch"](function (err) {
                                $rootScope.$evalAsync(function () {
                                    return deferred.reject(err);
                                });
                                return $rootScope.$apply();
                            });
                            return deferred.promise;
                        };
                    };
                    return {
                        create: function (name, options) {
                            var db;
                            db = new PouchDB(name, options);
                            return {
                                id: db.id,
                                put: qify(db.put.bind(db)),
                                post: qify(db.post.bind(db)),
                                get: qify(db.get.bind(db)),
                                remove: qify(db.remove.bind(db)),
                                bulkDocs: qify(db.bulkDocs.bind(db)),
                                allDocs: qify(db.allDocs.bind(db)),
                                changes: function (options) {
                                    var changes, deferred;
                                    changes = db.changes(options);
                                    deferred = $q.defer();
                                    changes.on('change', function (change) {
                                        $rootScope.$evalAsync(function () {
                                            return deferred.notify({
                                                change: change,
                                                changes: changes
                                            });
                                        });
                                        return $rootScope.$apply();
                                    });
                                    changes.on('complete', function (res) {
                                        $rootScope.$evalAsync(function () {
                                            return deferred.resolve(res);
                                        });
                                        return $rootScope.apply();
                                    });
                                    changes.on('err', function (err) {
                                        $rootScope.$evalAsync(function () {
                                            return deferred.reject(err);
                                        });
                                        return $rootScope.apply();
                                    });
                                    return deferred.promise;
                                },
                                putAttachment: qify(db.putAttachment.bind(db)),
                                getAttachment: qify(db.getAttachment.bind(db)),
                                removeAttachment: qify(db.removeAttachment.bind(db)),
                                query: qify(db.query.bind(db)),
                                info: qify(db.info.bind(db)),
                                compact: qify(db.compact.bind(db)),
                                revsDiff: qify(db.revsDiff.bind(db)),
                                replicate: {
                                    to: db.replicate.to.bind(db),
                                    from: db.replicate.from.bind(db),
                                    sync: db.replicate.sync.bind(db)
                                },
                                destroy: qify(db.destroy.bind(db))
                            };
                        }
                    };
                }
            ]
        };
    });

}).call(this);

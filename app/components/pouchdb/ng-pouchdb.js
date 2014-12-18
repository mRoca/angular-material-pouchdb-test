/*
 Based on https://github.com/wspringer/angular-pouchdb under MIT License
 Copyright (c) 2013-2014 Wilfred Springer, http://nxt.flotsam.nl/

 Based on https://github.com/danielzen/ng-pouchdb under MIT License
 © 2012 Peter Bacon Darwin © 2014 Daniel Zen http://zendigital.com
 */


var app = angular.module('pouchdb', []);

app.provider('pouchdb', function () {

    return {
        $get: ['$q', '$rootScope', '$parse', function ($q, $rootScope, $parse) {

            // Transform Pouch promises into $q ones
            var qify = function (fn) {
                return function () {
                    var deferred = $q.defer();
                    var args = arguments != null ? Array.prototype.slice.call(arguments) : [];

                    fn.apply(this, args)
                        .then(function (res) {
                            $rootScope.$evalAsync(function () {
                                return deferred.resolve(res);
                            });
                            return $rootScope.$apply();
                        })
                        .catch(function (err) {
                            $rootScope.$evalAsync(function () {
                                return deferred.reject(err);
                            });
                            return $rootScope.$apply();
                        });

                    return deferred.promise;
                };
            };

            /**
             * @class item in the collection
             * @param item
             * @param {int} index             position of the item in the collection
             *
             * @property {String} _id         unique identifier for this item within the collection
             * @property {int} $index         position of the item in the collection
             */
            var PouchDbItem = function (item, index) {
                this.$index = index;
                angular.extend(this, item);
            };

            return {
                displayLogs: true,
                log: function (args) {
                    this.displayLogs && console.log.apply(console, arguments);
                },
                error: function (obj) {
                    console.error(arguments);
                },
                createDB: function (collectionName, options) {

                    var db = new PouchDB(collectionName, options);

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
                },
                /**
                 * @return {Array} An array that will hold the items in the collection
                 */
                createCollection: function (collectionName) {

                    var self = this;
                    var collection = [];
                    var indexes = {};
                    var db = collection.$db = this.createDB(collectionName);

                    function addChild(index, item) {
                        indexes[item._id] = index;
                        collection.splice(index, 0, item);
                        self.log('added: ', index, item);
                    }

                    function removeChild(id) {
                        var index = indexes[id];

                        // Remove the item from the collection
                        collection.splice(index, 1);
                        indexes[id] = undefined;

                        self.log('removed: ', id);
                    }

                    function updateChild(index, item) {
                        collection[index] = item;
                        self.log('changed: ', index, item);
                    }

                    function moveChild(from, to, item) {
                        collection.splice(from, 1);
                        collection.splice(to, 0, item);
                        updateIndexes(from, to);
                        self.log('moved: ', from, ' -> ', to, item);
                    }

                    function updateIndexes(from, to) {
                        var length = collection.length;
                        to = to || length;
                        if (to > length) {
                            to = length;
                        }
                        for (var index = from; index < to; index++) {
                            var item = collection[index];
                            item.$index = indexes[item._id] = index;
                        }
                    }

                    db.changes({
                        live: true,
                        onChange: function (change) {
                            self.log('change', change);

                            if (!change.deleted) {
                                db.get(change.id).then(function (data) {
                                    if (indexes[change.id] == undefined) { // CREATE / READ
                                        addChild(collection.length, new PouchDbItem(data, collection.length)); // Add to end
                                        updateIndexes(0);
                                    } else { // UPDATE
                                        var index = indexes[change.id];
                                        var item = new PouchDbItem(data, index);
                                        updateChild(index, item);
                                    }
                                });
                            } else if (collection.length && typeof indexes[change.id] !== 'undefined') { //DELETE
                                removeChild(change.id);
                                updateIndexes(indexes[change.id]);
                            }
                        }
                    });

                    collection.$add = function (item) {
                        db.post(angular.copy(item)).then(
                            function (res) {
                                item._rev = res.rev;
                                item._id = res.id;
                            }
                        );
                    };

                    collection.$remove = function (itemOrId) {
                        var item = angular.isString(itemOrId) ? collection[itemOrId] : itemOrId;
                        db.remove(item)
                    };

                    collection.$update = function (itemOrId) {
                        var item = angular.isString(itemOrId) ? collection[itemOrId] : itemOrId;
                        var copy = {};

                        angular.forEach(item, function (value, key) {
                            if (key.charAt(0) !== '$') {
                                copy[key] = value;
                            }
                        });

                        db.get(item._id).then(
                            function (res) {
                                db.put(copy, res._rev);
                            }
                        );
                    };

                    return collection;
                },
                /**
                 * This service binds the scope expression to a pouchdb/couchdb database.
                 * There is no promise provided.
                 * @returns {Function} Returns a deregistration function for this listener.
                 */
                createBinding: function (collectionName, scope, expression) {

                    var self = this;
                    var getObj = $parse(expression);
                    var setObj = getObj.assign;

                    if (!setObj) {
                        throw new Error('expression ' + expression + 'must be assignable');
                    }

                    var db = this.createDB(collectionName);

                    db.get(expression).then(
                        function (res) {
                            setObj(scope, res);
                        },
                        function () {
                            var newVal = angular.copy(getObj(scope));
                            db.put(newVal, expression).then(
                                function (res) {
                                    newVal._rev = res.rev;
                                    newVal._id = res.id;
                                    setObj(newVal);
                                },
                                function (err) {
                                    self.error(err);
                                }
                            )
                        }
                    );

                    function equalsIgnoreRev(val1, val2) {
                        var cleanVal1 = angular.copy(val1);
                        var cleanVal2 = angular.copy(val2);
                        cleanVal1._rev = null;
                        cleanVal2._rev = null;
                        return angular.equals(cleanVal1, cleanVal2);
                    }

                    db.changes({
                        live: true,
                        onChange: function (change) {
                            if (!change.deleted) {
                                db.get(change.id).then(
                                    function (res) {
                                        setObj(scope, res);
                                    },
                                    function (err) {
                                        self.error(err);
                                    }
                                );
                            }
                        }
                    });

                    var listener = function (ngValue) {
                        db.get(expression).then(
                            function (dbVal) {
                                if (!equalsIgnoreRev(dbVal, ngValue) && ngValue._id) {
                                    db.put(angular.copy(ngValue)).then(
                                        function (res) {
                                            ngValue._rev = res.rev;
                                        },
                                        function (err) {
                                            self.error(err);
                                        }
                                    );
                                }
                            }
                        );
                    };

                    return scope.$watch(getObj, listener, true);
                }
            }
        }]
    };
});

//app.config(function () {
//
//});

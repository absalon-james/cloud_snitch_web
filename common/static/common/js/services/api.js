angular.module('cloudSnitch').factory('cloudSnitchApi', ['$http', '$q', 'timeService', function($http, $q, timeService) {

    var typesDeferred = $q.defer();
    var service = {};

    var headers = {};

    function convertTime(str) {
        var t = timeService.fromstr(str);
        t = timeService.utc(t);
        t = timeService.milliseconds(t);
        return t
    }

    service.types = function() {
        return $http({
            method: 'GET',
            url: '/api/models'
        }).then(function(resp) {
            // Success
            typesDeferred.resolve(resp.data);
            return typesDeferred.promise;
        }, function(resp) {
            // Error
            typesDeferred.reject(resp);
            return typesDeferred.promise;
        });
    };

    service.paths = function() {
        var defer = $q.defer();
        return $http({
            method: 'GET',
            url: '/api/paths'
        }).then(function(resp) {
            // Success
            defer.resolve(resp.data);
            return defer.promise;
        }, function(resp) {
            // Error
            defer.reject(resp);
            return defer.promise;
        });
    };

    service.times = function(model, identity, time) {
        var defer = $q.defer();
        var req = {
            model: model,
            identity: identity
        };

        if (time !== undefined) {
            time = convertTime(time);
            if (time > 0) {
                req.time = time;
            }
        }
        return $http({
            method: 'POST',
            url: '/api/objects/times/',
            headers: headers,
            data: req
        }).then(function(resp) {
            defer.resolve(resp.data);
            return defer.promise;
        }, function(resp) {
            // Error @TODO Error handling
            defer.reject(resp);
            return defer.promise;
        });
    };

    service.search = function(model, identity, time, filters, sink) {

        var defer = $q.defer();
        var req = {
            model: model,
            page: 1,
            pagesize: 500
        };
        if (identity !== undefined && identity != "") {
            req.identity = identity;
        }

        if (time !== undefined) {
            // Convert string time to timestamp
            time = convertTime(time);
            if (time > 0) {
                req.time = time;
            }
        }

        if (filters !== undefined) {
            var apiFilters = [];
            angular.forEach(filters, function(item) {
                apiFilters.push({
                    model: item.model,
                    prop: item.property,
                    operator: item.operator,
                    value: item.value
                });
            });
            req.filters = apiFilters;
        }

        function more(page) {
            req.page = page
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Type': 'application/json'
                },
                url: '/api/objects/search/',
                data: req
            }).then(function(resp) {
                sink(resp.data);
                if (req.page * req.pagesize >= resp.data.count) {
                    defer.resolve({});
                    return defer.promise
                }
                else {
                    return more(page + 1);
                }
            }, function(resp) {
                // @TODO - handle errors
                defer.reject(resp);
                return defer.promise;
            });
        }

        return more(1);
    };

    service.diffStructure = function(model, identity, leftTime, rightTime) {
        var req = {
            model: model,
            identity:identity,
            left_time: convertTime(leftTime),
            right_time: convertTime(rightTime)
        };
        console.log("Sending diff structure request with:");
        console.log(req);
        var defer = $q.defer()
        return $http({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Type': 'application/json'
            },
            url: '/api/objectdiffs/structure/',
            data: req
        }).then(function(resp) {
            // Success
            defer.resolve(resp.data);
            return defer.promise;
        }, function(resp) {
            // Error
            defer.reject(resp);
            return defer.promise;
        });
    };

    service.diffNodes = function(model, identity, leftTime, rightTime, offset, limit) {
        var req = {
            model: model,
            identity:identity,
            left_time: convertTime(leftTime),
            right_time: convertTime(rightTime),
            offset: offset,
            limit: limit
        };
        console.log("Sendiing diff nodes request with:");
        console.log(req);
        var defer = $q.defer()
        return $http({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Type': 'application/json'
            },
            url: '/api/objectdiffs/nodes/',
            data: req
        }).then(function(resp) {
            // Success
            defer.resolve(resp.data);
            return defer.promise;
        }, function(resp) {
            // Error
            defer.reject(resp);
            return defer.promise;
        });
    };

    return service;
}]);

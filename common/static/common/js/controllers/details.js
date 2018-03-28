/**
 * The details controller covers displaying object details.
 */
angular.module('cloudSnitch').controller('DetailsController', ['$scope', 'cloudSnitchApi', 'typesService', 'timeService', function($scope, cloudSnitchApi, typesService, timeService) {

    $scope.record = {};
    $scope.obj = {};
    $scope.type = undefined;
    $scope.identity = "";
    $scope.children = {};
    $scope.times = [];
    $scope.time = undefined;
    $scope.busy = false;

    $scope.loadChildren = function() {
        var modelChildren = typesService.typeMap[$scope.type].children;
        $scope.children = {};

        angular.forEach(modelChildren, function(value, key) {
            $scope.children[key] = {
                label: value.label,
                records: [],
                show: false,
                busy: false
            }
            $scope.searchChildren(key, value.label);
        });
    };

    $scope.isBusy = function() {
        var busy = false;

        if ($scope.busy) { busy = true; }
        angular.forEach($scope.children, function(childObj, childRef) {
            if (childObj.busy) { busy = true; }
        });
        return busy;
    };

    $scope.updateTimes = function() {
        $scope.times = [];
        $scope.busy = true;
        cloudSnitchApi.times(
            $scope.type,
            $scope.identity,
            $scope.paneObj.search.time
        ).then(function(data) {
            for (var i = 0; i < data.times.length; i++) {
                var t = data.times[i];
                t = timeService.fromMilliseconds(t);
                t = t.local(t);
                t = timeService.str(t);
                $scope.times.push(t);
                $scope.busy = false;
            }
        }, function(resp) {
            // @TODO - Error handling
            $scope.busy = false;
        });
    };

    $scope.toggleChild = function(childObj) {
        childObj.show = !childObj.show;
    };

    $scope.searchChildren = function(childRef, childLabel) {
        $scope.children[childRef].records = [];
        $scope.children[childRef].busy = true;
        cloudSnitchApi.search(
            childLabel,
            undefined,
            $scope.time,
            [{
                model: $scope.type,
                property: typesService.identityProperty($scope.type),
                operator: '=',
                value: $scope.identity
            }],
            function(data) {
                angular.forEach(data.records, function(item) {
                    $scope.children[childRef].records.push(item);
                });
            }
        ).then(function(result) {
            $scope.children[childRef].busy = false;
        }, function(resp) {
            // @TODO - error handling
            $scope.children[childRef].busy = false;
        });
    };

    $scope.childHeaders = function(childObj) {
        var headers = typesService.glanceViews[childObj.label];
        return headers;
    };

    $scope.childValues = function(childObj, childRecord) {
        var props = typesService.glanceViews[childObj.label];
        var obj = childRecord[childObj.label];
        var values = [];
        for (var i = 0; i < props.length; i++) {
            values.push(obj[props[i]]);
        }
        return values;
    };

    /**
     * Initialize the details with object and object type.
     */
    $scope.update = function() {
        var frame = $scope.frame();
        $scope.record = frame.record;
        $scope.type = frame.type;
        $scope.obj = frame.record[frame.type];

        var prop = typesService.identityProperty($scope.type);
        if (prop !== undefined) {
            $scope.identity = $scope.obj[prop];
        }

        $scope.loadChildren();
        if ($scope.times.length == 0) {
            $scope.updateTimes();
        }
        $scope.time = $scope.paneObj.search.time;
    };

    $scope.$watch('paneObj.stack.length', function(newVal) {
        $scope.update();
    });

}]);

/**
 * The details controller covers displaying object details.
 */
angular.module('cloudSnitch').controller('DetailsController', ['$scope', 'cloudSnitchApi', 'typesService', function($scope, cloudSnitchApi, typesService) {

    $scope.record = {};
    $scope.obj = {};
    $scope.type = undefined;
    $scope.identity = "";
    $scope.children = {};

    $scope.loadChildren = function() {
        var modelChildren = typesService.typeMap[$scope.type].children;
        $scope.children = {};

        angular.forEach(modelChildren, function(value, key) {
            $scope.children[key] = {
                label: value.label,
                records: [],
                loading: false,
                show: false
            }
            $scope.searchChildren(key, value.label);
        });
    };

    $scope.updateTimes = function() {
        cloudSnitchApi.times($scope.type, $scope.identity);
    };

    $scope.toggleChild = function(childObj) {
        childObj.show = !childObj.show;
    };

    $scope.searchChildren = function(childRef, childLabel) {
        $scope.children[childRef].records = [];
        $scope.children[childRef].loading = true;
        cloudSnitchApi.search(
            childLabel,
            undefined,
            $scope.paneObj.search.time,
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
            $scope.children[childRef].loading = false;
        }, function(resp) {
            // @TODO - error handling
            $scope.children[childRef].loading = false;
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
        // $scope.updateTimes();
    };

    $scope.$watch('paneObj.stack.length', function(newVal) {
        $scope.update();
    });

}]);

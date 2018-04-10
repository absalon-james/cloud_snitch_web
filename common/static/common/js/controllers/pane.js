/**
 * The pane controller covers searching.
 */
angular.module('cloudSnitch').controller('PaneController', ['$scope', 'cloudSnitchApi', 'typesService', function($scope, cloudSnitchApi, typesService) {

    $scope.paneObj = {};
    $scope.typesService = typesService;

    /**
     * Initialize the pane with a pane object from the parent controller.
     */
    $scope.init = function(paneObj) {
        $scope.paneObj = paneObj;
        $scope.updatePath();
    };

    /*
    $scope.$watch('typesService.isLoading()', function(isLoading) {
        if (!isLoading) {
            $scope.updatePath();
        }
    });
    */

    $scope.frame = function() {
        var stackSize = $scope.paneObj.stack.length;
        return $scope.paneObj.stack[stackSize - 1];
    };

    /**
     * Create a default filter.
     */
    $scope.defaultFilter = function() {
        return {
            model: $scope.paneObj.search.type,
            property: null,
            operator: '=',
            value: null
        }
    };

    /**
     * Add another filter
     */
    $scope.addFilter = function() {
        $scope.paneObj.search.filters.push($scope.defaultFilter());
    };

    /**
     * Remove filter
     */
    $scope.removeFilter = function(filter) {
        var index = $scope.paneObj.search.filters.indexOf(filter)
        $scope.paneObj.search.filters.splice(index, 1);
    };

    $scope.updatePath = function() {
        $scope.path = typesService.path($scope.paneObj.search.type);
    };

    $scope.recordHeaders = function() {
        var headers = [];
        var path = $scope.frame().path;
        if (path === undefined) {
            return [];
        }

        // moves last item to front of path (makes top-level first column)
        var sortedPath = path.slice(0)
        sortedPath.pop(sortedPath.unshift(sortedPath[sortedPath.length-1])-1)

        angular.forEach(sortedPath, function(item) {
            var props = typesService.glanceProperties(item);
            for (var i = 0; i < props.length; i++) {
                var header = item + '.' + props[i];
                header = header.replace('.', ' ').replace('_', '' ).replace('-', '');
                headers.push(header);
            }
        });

        return headers;
    };

    $scope.recordValues = function(record) {
        var values = [];
        var path = $scope.frame().path;

        // moves last item to front of path (makes top-level first column)
        var sortedPath = path.slice(0)
        sortedPath.pop(sortedPath.unshift(sortedPath[sortedPath.length-1])-1)

        angular.forEach(sortedPath, function(label) {
            var props = typesService.glanceProperties(label);
            for (var i = 0; i < props.length; i++) {
                values.push(record[label][props[i]]);
            }
        });
        return values;
    };


    /**
     *
     */
    $scope.search = function() {
        var path = typesService.path($scope.paneObj.search.type);

        $scope.paneObj.loading = true;
        $scope.paneObj.stack.push({
            state: 'results',
            results: [],
            path: path
        });

        cloudSnitchApi.search(
            $scope.paneObj.search.type,
            $scope.paneObj.search.identity,
            $scope.paneObj.search.time,
            $scope.paneObj.search.filters,
            function(data) {
                // Check to make sure we are still on search results
                if ($scope.paneObj.stack.length > 1) {
                    angular.forEach(data.records, function(item) {
                        $scope.paneObj.stack[1].results.push(item);
                    });
                }
            }
        ).then(function(result) {
            // Do nothing for now
            $scope.paneObj.loading = false;
        }, function(resp) {
            // @TODO Error handling
            $scope.paneObj.loading = false;
            $scope.paneObj.stack.splice(-1, 1);
        });
    };

    $scope.details = function(type, record) {
        $scope.paneObj.stack.push({
            state: 'details',
            record: record,
            type: type
        });
        $scope.paneObj.loading = false;
    };

    $scope.identity = function($index) {
        var frame = $scope.paneObj.stack[$index];
        if (frame.state != 'details') {
            return undefined;
        }
        return frame.record[frame.type][typesService.identityProperty(frame.type)];
    };

    $scope.frameJump = function($index) {
        if ($index < $scope.paneObj.stack.length) {
            var numSplice = $scope.paneObj.stack.length - ($index + 1);
            $scope.paneObj.stack.splice($index + 1, numSplice);
        }
    };

    /**
     * Mark pane as deleted. The parent controller will remove it.
     */
    $scope.close = function() {
        $scope.paneObj.deleted = true;
        $scope.updatePanes();
    };

    $scope.back = function() {
        if ($scope.paneObj.stack.length > 1) {
            $scope.paneObj.stack.splice(-1, 1);
        }
    };
}]);

/**
 * Controller for the multiple panes.
 */
angular.module('cloudSnitch').controller('PanesController', ['$scope', 'timeService', function($scope, timeService) {
    $scope.panes = [];
    $scope.numPanes = 0;
    $scope.maxPanes = 2;

    /**
     * Add a pane
     */
    $scope.addPane = function() {
        if ($scope.numPanes + 1 > $scope.maxPanes) {
            return true;
        }

        $scope.panes.push({
            search: {
                type: 'Environment',
                identity: '',
                time: timeService.str(timeService.now()),
                filters: [],
                properties: [],
            },
            loading: false,
            stack: [{ state: 'search' }],
            deleted: false
        });

        $scope.numPanes++;
    };

    /**
     * Look for pane updates
     */
    $scope.updatePanes = function() {
        for (var i = $scope.panes.length - 1; i >= 0; i--) {
            if ($scope.panes[i].deleted) {
              $scope.panes.splice(i, 1);
              $scope.numPanes--;
            }
        }
    };

    /**
     * Copy a pane
     */
    $scope.copyPane = function(srcPane) {
        if ($scope.panes.length < $scope.maxPanes) {
            $scope.panes.push(angular.copy(srcPane));
            $scope.numPanes++;
        }
    };

    // Start with one pane.
    $scope.addPane();
}]);

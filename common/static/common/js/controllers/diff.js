/**
 * The details controller covers displaying object details.
 */
angular.module('cloudSnitch').controller('DiffController', ['$scope', '$interval', 'cloudSnitchApi', 'typesService', 'timeService', function($scope, $interval, cloudSnitchApi, typesService, timeService) {

    $scope.frame = undefined;
    $scope.nodeMap = undefined;
    $scope.nodes = undefined;
    $scope.nodeCount = 0;
    $scope.state = 'loadingStructure';

    var pollStructure;
    var pollNodes;

    var pollInterval = 3000;
    var nodePageSize = 500;
    var nodeOffset = 0;

    var margin = {
        top: 20,
        bottom: 20,
        right: 20,
        left: 20
    }

    var tree = d3.tree();
    var svgSize = undefined;
    var treeSize = undefined;

    function stopPolling() {
        console.log('Stopping the polling');
        if (angular.isDefined(pollStructure)) {
            $interval.cancel(pollStructure);
            pollStructure = undefined;
        }
    };

    function stopPollingNodes() {
        console.log('Stopping polling of nodes');
        if (angular.isDefined(pollNodes)) {
            $interval.cancel(pollNodes);
            pollNodes = undefined;
        }
    }

    function sizeTree() {
    }

    function render() {
        var svg = d3.select('svg#diff');
        var g = svg.append('g').attr('transform', 'translate(' + margin.top + ',' + margin.left+ ')');

        // Calculate size svg should be.
        // Calcule size tree should be including margin.

        tree.size([800, 800]);
        var root = d3.hierarchy($scope.frame);
        tree(root);


        var link = g.selectAll(".link")
            .data(tree(root).links())
            .enter().append('path')
                .attr('class', 'link')
                .attr('d', d3.linkHorizontal().x(function(d) { return d.y; }).y(function(d) { return d.x; }));

        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
                .attr("class", function(d) {
                    var classes = 'node';
                    if (d.children)
                        classes += ' node--internal';
                    else
                        classes += ' node--leaf';

                    console.log("Checking side:");
                    console.log(d);
                    switch (d.data.side) {
                        case 'left':
                            classes += ' removed';
                            break;
                        case 'right':
                            classes += ' added';
                            break;
                        default:
                            classes += ' unchanged';
                            break;
                    }
                    return classes;
                })
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

        node.append("circle")
            .attr("r", 15)
            .attr("fill", function(d) {
                var fill = 'url(';
                switch (d.data.side) {
                    case 'left':
                        fill += '#removedGradient';
                        break;
                    case 'right':
                        fill += '#addedGradient';
                        break;
                    default:
                        fill += '#unchangedGradient';
                }
                fill += ')';
                return fill;
            });
        node.append("text")
            .attr("dy", 3)
            .attr("x", function(d) { return d.children ? 15: -15})
            .style("text-anchor", function(d) { return d.children ? "start": "end"; })
            .text(function(d) {
                return d.data.id;
            });
    }

    function getNodes() {
        console.log("Polling for nodes");
        var offset = nodeOffset;
        cloudSnitchApi.diffNodes($scope.diff.type, $scope.diff.id, $scope.diff.leftTime, $scope.diff.rightTime, offset, nodePageSize)
        .then(function(result) {
            // Check if the diff tree is finished
            if (!angular.isDefined(result.nodes)) { return; }

            // Check if this is a redundant request.
            if (nodeOffset > offset) { return; }

            // Update the nodes array.
            for (var i = 0; i < result.nodes.length; i++) {
                $scope.nodes[offset + i] = result.nodes[i];
            }

            // Update node offset for next polling
            nodeOffset += result.nodes.length;

            console.log("nodes: ");
            console.log($scope.nodes);

            // Check if this is the last request
            if (result.nodes.length < nodePageSize) {
                stopPollingNodes();
            }
        }, function(resp) {
            console.log("Error obtaining nodes.");
        });
    }

    function getStructure() {
        console.log("Polling for structure");
        cloudSnitchApi.diffStructure($scope.diff.type, $scope.diff.id, $scope.diff.leftTime, $scope.diff.rightTime)
        .then(function(result) {

            if (!angular.isDefined(result.frame)) {
                return;
            }

            stopPolling();

            $scope.state = 'loadingNodes';
            $scope.frame = result.frame;
            $scope.nodeMap = result.nodemap;
            $scope.nodeCount = result.nodecount;
            $scope.nodes = new Array($scope.nodeCount);
            console.log("Got the diff data");
            console.log($scope.frame);
            pollNodes = $interval(getNodes, pollInterval);
            render();
        }, function(resp) {
            console.log("error obtaining structure.");
        });
    }

    $scope.update = function() {
        $scope.frame = undefined;
        $scope.nodeMap = undefined;
        $scope.nodes = undefined;
        $scope.nodeCount = 0;
        $scope.state = 'loadingStructure';
        pollStructure = $interval(getStructure, pollInterval);
    };

    $scope.$watch('diff', function(newVal) {
        $scope.update();
    });

    $scope.$on('$destroy', function() {
        stopPolling();
        stopPollingNodes();
    });

}]);

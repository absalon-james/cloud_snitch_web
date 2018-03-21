angular.module('cloudSnitch')
  .controller('MainController', ['$scope', 'cloudSnitchApi', function($scope, cloudSnitchApi) {
    $scope.types = [];
    $scope.props = [];
    // @TODO - Retrieve available operators from api
    $scope.operators = [
      '=',
      '<',
      '<=',
      '>',
      '>=',
      '<>',
      'CONTAINS',
      'STARTS WITH',
      'ENDS WITH'
    ];

    cloudSnitchApi.types().then(function(result) {
        $scope.types = result
        console.log("Types: ");
        console.log(result);
    }, function(error) {
        $scope = [];
        console.log(error.statusText);
    });
  }])

  .controller('PanesController', ['$scope', function($scope) {
    $scope.panes = [];
    $scope.numPanes = 0;
    $scope.maxPanes = 2;

    $scope.defaultFilter = function() {
      return {
        property: null,
        operator: '=',
        value: null
      }
    };

    $scope.addPane = function() {
      if ($scope.numPanes + 1 > $scope.maxPanes) {
        return true;
      }

      $scope.panes.push({
        search: {
          type: 'Environment',
          identity: '',
          time: 'Now',
          filters: [$scope.defaultFilter()],
          properties: []
        },
        stack: [],
        deleted: false
      });

      $scope.numPanes++;
    };

    $scope.updatePanes = function() {
      for (var i = $scope.panes.length - 1; i >= 0; i--) {
        if ($scope.panes[i].deleted) {
          $scope.panes.splice(i, 1);
          $scope.numPanes--;
        }
      }
    };

    $scope.addPane();
  }])

  .controller('PaneController', ['$scope', 'cloudSnitchApi', function($scope, cloudSnitchApi) {

    $scope.paneObj = {};

    $scope.init = function(paneObj) {
        $scope.paneObj = paneObj;
    };

    $scope.addFilter = function() {
        $scope.paneObj.search.filters.push(defaultFilter());
    };

    $scope.updateProperties = function() {
      console.log("Updating properties");
      $scope.paneObj.search.properties = [];
      for (var i = 0; i < $scope.types.length; i++) {
        var t = $scope.types[i];
        console.log("Checking type " + t.label);
        if (t.label == $scope.paneObj.search.type) {
          $scope.paneObj.search.properties.push(t.identity_property)
          for (var j = 0; j < t.static_properties.length; j++) {
            $scope.paneObj.search.properties.push(t.static_properties[j]);
          }
          for (var j = 0; j < t.state_properties.length; j++) {
            $scope.paneObj.search.properties.push(t.state_properties[j]);
          }
          break;
        }
      }
    };
  }]);

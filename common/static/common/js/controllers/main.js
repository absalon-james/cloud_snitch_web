/**
 * Main controller. Holds various app wide things.
 */
angular.module('cloudSnitch').controller('MainController', ['$scope', 'typesService', function($scope, typesService) {
    $scope.types = [];
    $scope._typesService = typesService;


    $scope.$watch('_typesService.types', function(types) {
        $scope.types = types;
    });

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
}]);

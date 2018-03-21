angular.module('cloudSnitch')
  .factory('cloudSnitchApi', ['$http', '$q', function($http, $q) {

    var typesDeferred = $q.defer();

    var service = {};

    service.types = function() {
      return $http({
        method: 'GET',
        url: '/api/models'
      }).then(function(resp) {
        // Success
        console.log(resp);
        typesDeferred.resolve(resp.data);
        return typesDeferred.promise;
      }, function(resp) {
        // Error
        console.log(resp);
        typesDeferred.reject(resp);
        return typesDeferred.promise;
      });
    };
    return service;
  }]);

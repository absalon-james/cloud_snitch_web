angular.module('cloudSnitch').factory('typesService', ['cloudSnitchApi', function(cloudSnitchApi) {

    var service = {};
    service.types = [];
    service.paths = {};

    service.glanceViews = {
        AptPackage: ['name', 'version'],
        Configfile: ['path'],
        Device: ['name'],
        Environment: ['account_number', 'name'],
        GitRemote: ['name'],
        GitRepo: ['path'],
        GitUntrackedFile: ['path'],
        GitUrl: ['url'],
        Host: ['hostname'],
        Interface: ['device'],
        Mount: ['mount'],
        NameServer: ['ip'],
        Partition: ['name'],
        PythonPackage: ['name', 'version'],
        Uservar: ['name', 'value'],
        Virtualenv: ['path'],
    }

    service.glanceProperties = function(label) {
        return service.glanceViews[label];
    };

    service.updatePaths = function() {
        cloudSnitchApi.paths().then(function(result) {
            service.paths = result;
        }, function(error) {
            // @TODO - Do something with errors.
            service.paths = {};
        });
    }

    service.updateTypes = function() {
        cloudSnitchApi.types().then(function(result) {
            service.types = result;
        }, function(error) {
            // @TODO - Do something with error
            service.types = [];
        });
    }

    service.path = function(label) {
        path = service.paths[label];
        path.push(label);
        return path;
    };

    service.update = function() {
        service.updateTypes();
        service.updatePaths();
    };

    service.update()
    return service;
}]);

angular.module('cloudSnitch').directive('pane', function() {
    return {
        templateUrl: '/static/common/html/pane.html'
    };
});

angular.module('cloudSnitch').directive('addpanebox', function() {
    return {
        templateUrl: '/static/common/html/addpanebox.html'
    };
});

angular.module('cloudSnitch').directive('panetopctrl', function() {
    return {
          templateUrl: '/static/common/html/panetopctrl.html'
    };
});

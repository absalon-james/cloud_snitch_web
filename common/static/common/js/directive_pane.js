angular.module('cloudSnitch')
  .directive('pane', function() {
    return {
      templateUrl: '/static/common/html/pane.html'
    };
  })

  .directive('addpanebox', function() {
    return {
      templateUrl: '/static/common/html/addpanebox.html'
    };
  })

  .directive('panetopctrl', function() {
    return {
      templateUrl: '/static/common/html/panetopctrl.html'
    };
  });

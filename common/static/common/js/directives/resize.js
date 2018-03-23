'use strict';

var app = angular.module('cloudSnitch');

app.directive('resize', ['$window', '$timeout', function($window, $timeout) {
    return {
        link: link,
        restrict: 'A'
    }

    function elementNumericProperty(element, prop) {
        var style = $window.getComputedStyle(element, null);
        return Number(style.getPropertyValue(prop).replace('px', ''));
    }

    function setHeight($element) {

        var header = angular.element('header#head')[0];
        var headerHeight = elementNumericProperty(header, 'height');
        console.log("Header height: " + headerHeight);

        var footer = angular.element('footer#foot')[0];
        var footerHeight = elementNumericProperty(footer, 'height');
        console.log("Footer height: " + footerHeight);

        var newHeight =
            $window.innerHeight -
            headerHeight -
            footerHeight;

        console.log("New height: " + newHeight);
        $element.css('height', newHeight + 'px');
    }

    function link($scope, $element, $attrs) {
        angular.element($window).bind('resize', function() {
            setHeight($element);
        });
        $timeout(function() {
            angular.element($window).triggerHandler('resize');
        });
    }

}]);



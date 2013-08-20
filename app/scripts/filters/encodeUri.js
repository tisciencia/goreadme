'use strict';

angular.module('goreadmeApp')
  .filter('encodeUri', function () {
    return encodeURIComponent;
  });

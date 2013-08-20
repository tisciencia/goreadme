'use strict';

describe('Filter: encodeUri', function () {

  // load the filter's module
  beforeEach(module('goreadmeApp'));

  // initialize a new instance of the filter before each test
  var encodeUri;
  beforeEach(inject(function ($filter) {
    encodeUri = $filter('encodeUri');
  }));

  it('should return an encoded url"', function () {
    var text = 'http://vidadesuporte.com.br/suporte-a-serie/estigma/';
    expect(encodeUri(text)).toBe('http%3A%2F%2Fvidadesuporte.com.br%2Fsuporte-a-serie%2Festigma%2F');
  });

});

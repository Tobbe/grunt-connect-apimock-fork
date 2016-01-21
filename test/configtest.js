'use strict';

var grunt = require('grunt');
var http = require('http');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.connect_apimock = {
  setUp: function (done) {
    // setup here if necessary
    done();
  },
  global_config: function(test){
    test.expect(1);
    http.request({
      path: '/api/simple/users/',
      method: 'GET',
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(404, response.statusCode, 'global config url /api/ should not be mocked');
        test.done();
      });
    }).end();
  },
  local_config: function(test){
    test.expect(2);
    http.request({
      path: '/api2/simple/users/',
      method: 'GET',
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(200, response.statusCode);
        var expected = grunt.file.read('test/api/simple/users.json');
        test.equal(data, expected, 'GET /api2/simple/users/ should return test/api/simple/users.json');
        test.done();
      });
    }).end();
  }
  
};

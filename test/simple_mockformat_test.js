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

function testSimpleMockformat(test, path, method, expectedFilepath, failMessage){
    test.expect(3);
    http.request({
      path: path,
      method: method,
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(response.statusCode, 200);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var expected = grunt.file.read(expectedFilepath);
        test.equal(data, expected, failMessage);
        test.done();
      });
    }).end();
}

exports.connect_apimock = {
  setUp: function (done) {
    // setup here if necessary
    done();
  },
  get_users: function(test){
    testSimpleMockformat(test, 
      '/api/simple/users/',
      'GET',
      'test/api/simple/users.json',
      'GET /api/simple/users/ should return test/api/simple/users.json');
  },
  get_user1: function(test){
    testSimpleMockformat(test, 
      '/api/simple/users/1',
      'GET',
      'test/api/simple/users/1.json',
      'GET /api/simple/users/1 should return test/api/simple/users/1.json');
  },
  post_users: function(test){
    testSimpleMockformat(test, 
      '/api/simple/users/',
      'POST',
      'test/api/simple/users_post.json',
      'POST /api/simple/users/ should return test/api/simple/users_post.json');
  },
  put_users: function(test){
    testSimpleMockformat(test, 
      '/api/simple/users/1',
      'PUT',
      'test/api/simple/users/1_put.json',
      'PUT /api/simple/users/ should return test/api/simple/users/1_put.json');
  },
  delete_users: function(test){
    testSimpleMockformat(test, 
      '/api/simple/users/1',
      'DELETE',
      'test/api/simple/users/1_delete.json',
      'DELETE /api/simple/users/ should return test/api/simple/users/1_delete.json');
  },


  path_not_found: function(test){
    test.expect(3);
    http.request({
      path: '/api/simple/users/1234',
      method: 'GET',
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(response.statusCode, 500);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var expected = 'Can not find mockfile. See server log';
        var responseBody = JSON.parse(data);
        test.equal(responseBody.error, expected, 'path_not_found should return error');
        test.done();
      });
    }).end();
  }
  
};

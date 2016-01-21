/*
 * grunt-connect-apimock
 * git-ljo
 *
 * Copyright (c) 2015 Lars Johansson
 * Licensed under the MIT license.
 */

'use strict';

var apimock = require('../lib/apimock');

module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('configureApimock', 'Configure apimock.', function(target){
    var configLocation = 'connect.apimock';
    if(target){
      configLocation = 'connect.'+target+'.apimock';
    }

    var apimockOptions = grunt.config(configLocation);
    if(apimockOptions === undefined){
      grunt.log.error(configLocation + ' configuration is missing!');
      return;
    }

 
    if(apimockOptions.url === undefined){
      grunt.log.error('url configuration is missing!');
      return;
    }
    if(apimockOptions.dir === undefined){
      grunt.log.error('dir configuration is missing!');
      return;
    }
    apimock.config(apimockOptions);
  });

};

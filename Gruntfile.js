/*
 * grunt-connect-apimock
 * git-ljo
 *
 * Copyright (c) 2015 Lars Johansson
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  // load all npm grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'lib/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Unit tests.
    nodeunit: {
      configtest: 'test/configtest.js',
      tests: ['test/*_test.js']
    },

    //web server for testing the plugin
    connect: {
      options: {
            port: 8000,
            // Change this to '0.0.0.0' to access the server from outside.
            hostname: '0.0.0.0',//'localhost',
            livereload: 35729,
            middleware: function (connect) {
                var middlewares = [];
                //mock rest api with files
                middlewares.push(require('./lib/apimock').mockRequest);
                return middlewares;
            }
      },
      apimock: {
        url: '/api/',
        dir: 'test/api'
      },
      serve: {
          options:{
          }
      },
      test: {
          options:{
            port: 8080
          }
      },
      configtest: {
          apimock: {
            url: '/api2/',
            dir: 'test/api'
          },
          options:{
            port: 8080
          }
      }
    },

    //watch
    watch: {
        js: {
          files: ['lib/**/*.js', 'test/**/*.js', 'tasks/**/*.js'],
          tasks: ['jshint', 'test']
        }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [
    'clean',
    'configureApimock', 
    'connect:test', 
    'nodeunit:tests'
    ]);

  grunt.registerTask('configtest', [
    'configureApimock:configtest', 
    'connect:configtest', 
    'nodeunit:configtest',
    ]);

  grunt.registerTask('serve', ['configureApimock', 'connect:serve', 'watch']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};

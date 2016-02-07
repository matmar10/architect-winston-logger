/*
 * grunt-configure-firebase
 * https://github.com/QulinaryOrg/grunt-configure-firebase
 *
 * Copyright (c) 2015 Matthew J. Martin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  // project configuration.
  grunt.initConfig({

    // make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: [
          'Gruntfile.js',
          'index.js',
          'tests/*.js'
        ]
      }
    },

    // enforce code style guideline
    jsbeautifier: {
      options: {
        config: '.jsbeautifyrc'
      },
      fix: {
        options: {
          mode: 'VERIFY_AND_WRITE'
        },
        src: [
          'Gruntfile.js',
          'index.js',
          'tests/*.js'
        ]
      },
      test: {
        options: {
          mode: 'VERIFY_ONLY'
        },
        src: [
          'Gruntfile.js',
          'index.js',
          'tests/*.js'
        ]
      }
    },

    // for cutting new releases
    release: {}

  });

  // enforce code quaity
  grunt.registerTask('codequality', ['jshint', 'jsbeautifier:test']);

  // whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['codequality']);

  // by default, fix style of files and run all tests
  grunt.registerTask('default', ['jsbeautifier:fix', 'test']);

};

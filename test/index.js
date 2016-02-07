'use strict';

var assert = require('assert');
var fs = require('fs');
var pluginMeta = JSON.parse(fs.readFileSync(__dirname + '/../package.json')).plugin;

describe('setup', function() {

  it('uses default transports if none provided', function (done) {
    require('./../index.js')(pluginMeta, {}, function (err, services) {
      assert(!err, 'No error triggered');
      assert(services instanceof Object, 'Services exported should be an object');
      assert(services.logger instanceof Object, 'Services should export a logger object');
      assert(services.logger.transports instanceof Object, 'Logger has transports');
      assert(services.logger.transports.console instanceof Object, 'Logger has console transport');
      done();
    });
  });

  it('returns a logger instance with specified transports', function (done) {
    require('./../index.js')({
      transports: {
        console: {
          colorize: true,
          level: 'silly'
        },
        file: {
          filename: 'somefile.log'
        }
      }
    }, {}, function (err, services) {
      assert(!err, 'No error triggered');
      assert(services instanceof Object, 'Services exported should be an object');
      assert(services.logger instanceof Object, 'Services should export a logger object');
      assert(services.logger.transports instanceof Object, 'Logger has transports');
      assert(services.logger.transports.console instanceof Object, 'Logger has console transport');
      assert(services.logger.transports.file instanceof Object, 'Logger has file transport');
      assert(services.logger.transports.file.filename === 'somefile.log', 'Logger has correct file transport options');
      done();
    });
  });

});

describe('loggerFactory', function () {
  it('disallows creation without category', function (done) {
    require('./../index.js')(pluginMeta, {}, function (err, services) {
      try {
        services.loggerFactory.create();
        assert(false, 'Triggers an error when no category provided');
      } catch (err) {
        assert(err instanceof Error, 'Triggers an error when no category provided');
      }
      done();
    });
  });
  it('uses default transports', function (done) {
    require('./../index.js')(pluginMeta, {}, function (err, services) {
      var logger1 = services.loggerFactory.create('category 1');
      assert(logger1 instanceof Object, 'Services should export a logger object');
      assert(logger1 instanceof Object, 'Logger has transports');
      assert(logger1.transports.console instanceof Object, 'Logger has console transport');
      done();
    });
  });
  it('Configures label', function (done) {
    require('./../index.js')(pluginMeta, {}, function (err, services) {
      var logger1 = services.loggerFactory.create('category 1', 'category-1-prefix');
      assert(logger1.transports.console.label === 'category-1-prefix', 'Console transport has correct label');
      done();
    });
  });
  it('uses respects specified additional transports', function (done) {
    require('./../index.js')(pluginMeta, {}, function (err, services) {
      var logger1 = services.loggerFactory.create('something', 'something-prefix', {
        file: {
          filename: 'somefile.log'
        }
      });
      assert(logger1 instanceof Object, 'Services should export a logger object');
      assert(logger1 instanceof Object, 'Logger has transports');
      assert(logger1.transports.console instanceof Object, 'Logger has console transport');
      assert(logger1.transports.file instanceof Object, 'Logger has file transport');
      assert(logger1.transports.file.filename === 'somefile.log', 'Logger has correct file transport options');
      done();
    });
  });
});

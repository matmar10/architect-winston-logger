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
        Console: {
          colorize: true,
          level: 'silly'
        },
        File: {
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

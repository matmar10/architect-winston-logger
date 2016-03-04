'use strict';

var assert = require('assert');
var fs = require('fs');
var pluginMeta = JSON.parse(fs.readFileSync(__dirname + '/../package.json')).plugin;

describe('loggerTransportRegistry', function () {

  describe('register', function () {
    it('assigns the specified transport by name', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var WinstonRaygun = require('winston-raygun');
        var loggerTransportRegistry = services.loggerTransportRegistry;
        loggerTransportRegistry.register(WinstonRaygun);
        assert(WinstonRaygun === loggerTransportRegistry.transports[WinstonRaygun.prototype.name],
            'Assigns transport type to transports name');
        done();
      });
    });
  });

  describe('get', function () {
    it('provides the specified transport by name', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var WinstonRaygun = require('winston-raygun');
        var loggerTransportRegistry = services.loggerTransportRegistry;
        loggerTransportRegistry.register(WinstonRaygun);
        assert(WinstonRaygun === loggerTransportRegistry.get('raygun'), 'Gets raygun by name');
        done();
      });
    });
  });

  describe('build', function () {
    it('builds a built-in transport with default options', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var loggerTransportRegistry = services.loggerTransportRegistry;
        var winston = require('winston');
        var transport = loggerTransportRegistry.build('console');
        assert(transport instanceof winston.transports.Console,
            'Requesting console transport produces instance of Console');
        assert(transport.level === 'info', 'Produces console transport with default setting `level`');
        assert(transport.silent === false, 'Produces console transport with default setting `silent`');
        assert(transport.raw === false, 'Produces console transport with default setting `raw`');
        assert(transport.handleExceptions === false,
            'Produces console transport with default setting `handleExceptions`');
        assert(transport.json === false, 'Produces console transport with default setting `json`');
        assert(transport.colorize === false, 'Produces console transport with default setting `colorize`');
        assert(transport.prettyPrint === false, 'Produces console transport with default setting `prettyPrint`');
        assert(transport.timestamp === false, 'Produces console transport with default setting `timestamp`');
        assert(transport.label === null, 'Produces console transport with default setting `label`');
        done();
      });
    });
    it('builds a built-in transport with merged options', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var loggerTransportRegistry = services.loggerTransportRegistry;
        var winston = require('winston');
        var transport = loggerTransportRegistry.build('console', {
          level: 'silly',
          silent: true,
          raw: true,
          handleExceptions: true
        });
        assert(transport instanceof winston.transports.Console,
            'Requesting console transport produces instance of Console');
        assert(transport.level === 'silly', 'Produces console transport with default setting `level`');
        assert(transport.silent === true, 'Produces console transport with default setting `silent`');
        assert(transport.raw === true, 'Produces console transport with default setting `raw`');
        assert(transport.handleExceptions === true,
            'Produces console transport with default setting `handleExceptions`');
        assert(transport.json === false, 'Produces console transport with default setting `json`');
        assert(transport.colorize === false, 'Produces console transport with default setting `colorize`');
        assert(transport.prettyPrint === false, 'Produces console transport with default setting `prettyPrint`');
        assert(transport.timestamp === false, 'Produces console transport with default setting `timestamp`');
        assert(transport.label === null, 'Produces console transport with default setting `label`');
        done();
      });
    });
    it('builds a registered transport with default options', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var loggerTransportRegistry = services.loggerTransportRegistry;
        var WinstonRaygun = require('winston-raygun');
        loggerTransportRegistry.register(WinstonRaygun, {
          apiKey: 'foobar'
        });
        var transport = loggerTransportRegistry.build('raygun');
        assert(transport instanceof WinstonRaygun,
            'Requesting winston transport produces instance of WinstonRaygun');
        assert(transport.apiKey === 'foobar', 'Produces console transport with default setting `silent`');
        assert(transport.level === 'info', 'Produces console transport with default setting `level`');
        assert(transport.silent === false, 'Produces console transport with default setting `silent`');
        assert(transport.raw === false, 'Produces console transport with default setting `raw`');
        assert(transport.handleExceptions === false,
            'Produces console transport with default setting `handleExceptions`');
        done();
      });
    });
  });

  describe('buildAll', function () {
    it('builds all transports with default options', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {

        var winston = require('winston');
        var loggerTransportRegistry = services.loggerTransportRegistry;
        var WinstonRaygun = require('winston-raygun');
        loggerTransportRegistry.register(WinstonRaygun, {
          apiKey: 'foobar'
        });
        var transports = loggerTransportRegistry.buildAll({
          'console': {},
          'raygun': {}
        });

        assert(transports.console instanceof winston.transports.Console,
            'Requesting console transport produces instance of Console');
        assert(transports.console.level === 'info', 'Produces console transport with default setting `level`');
        assert(transports.console.silent === false, 'Produces console transport with default setting `silent`');
        assert(transports.console.raw === false, 'Produces console transport with default setting `raw`');
        assert(transports.console.handleExceptions === false,
            'Produces console transport with default setting `handleExceptions`');
        assert(transports.console.json === false, 'Produces console transport with default setting `json`');
        assert(transports.console.colorize === false, 'Produces console transport with default setting `colorize`');
        assert(transports.console.prettyPrint === false,
            'Produces console transport with default setting `prettyPrint`');
        assert(transports.console.timestamp === false, 'Produces console transport with default setting `timestamp`');
        assert(transports.console.label === null, 'Produces console transport with default setting `label`');

        assert(transports.raygun instanceof WinstonRaygun,
            'Requesting winston transport produces instance of WinstonRaygun');
        assert(transports.raygun.apiKey === 'foobar', 'Produces console transport with default setting `silent`');
        assert(transports.raygun.level === 'info', 'Produces console transport with default setting `level`');
        assert(transports.raygun.silent === false, 'Produces console transport with default setting `silent`');
        assert(transports.raygun.raw === false, 'Produces console transport with default setting `raw`');
        assert(transports.raygun.handleExceptions === false,
            'Produces console transport with default setting `handleExceptions`');
        done();
      });
    });
    it('builds all transports with merged options', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var winston = require('winston');
        var loggerTransportRegistry = services.loggerTransportRegistry;
        var WinstonRaygun = require('winston-raygun');
        loggerTransportRegistry.register(WinstonRaygun, {
          apiKey: 'foobar'
        });
        var transports = loggerTransportRegistry.buildAll({
          'console': {
            level: 'debug'
          },
          'raygun': {
            level: 'debug'
          }
        });

        assert(transports.console instanceof winston.transports.Console,
            'Requesting console transport produces instance of Console');
        assert(transports.console.level === 'debug', 'Produces console transport with overridden setting `level`');
        assert(transports.console.silent === false, 'Produces console transport with default setting `silent`');
        assert(transports.console.raw === false, 'Produces console transport with default setting `raw`');
        assert(transports.console.handleExceptions === false,
            'Produces console transport with default setting `handleExceptions`');
        assert(transports.console.json === false, 'Produces console transport with default setting `json`');
        assert(transports.console.colorize === false, 'Produces console transport with default setting `colorize`');
        assert(transports.console.prettyPrint === false,
            'Produces console transport with default setting `prettyPrint`');
        assert(transports.console.timestamp === false, 'Produces console transport with default setting `timestamp`');
        assert(transports.console.label === null, 'Produces console transport with default setting `label`');

        assert(transports.raygun instanceof WinstonRaygun,
            'Requesting winston transport produces instance of WinstonRaygun');
        assert(transports.raygun.apiKey === 'foobar', 'Produces console transport with default setting `silent`');
        assert(transports.raygun.level === 'debug', 'Produces console transport with overridden setting `level`');
        assert(transports.raygun.silent === false, 'Produces console transport with default setting `silent`');
        assert(transports.raygun.raw === false, 'Produces console transport with default setting `raw`');
        assert(transports.raygun.handleExceptions === false,
            'Produces console transport with default setting `handleExceptions`');
        done();
      });
    });
  });
});




describe('loggerFactory', function () {

  describe('setDefaultTransports', function () {
    it('sets default transports', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var loggerFactory = services.loggerFactory;
        var defaultTransports = {
          'console': {
            level: 'silly'
          },
          'file' : {
            filename: 'some-dir/some-file'
          }
        };
        loggerFactory.setDefaultTransports(defaultTransports);
        assert(loggerFactory.defaultTransports === defaultTransports, 'Registers default transports');
        done();
      });
    });
  });

  describe('getDefaultTransports', function () {
    it('gets default transports', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var loggerFactory = services.loggerFactory;
        var defaultTransports = {
          'console': {
            level: 'silly'
          },
          'file' : {
            filename: 'some-dir/some-file'
          }
        };
        loggerFactory.setDefaultTransports(defaultTransports);
        assert(defaultTransports === loggerFactory.getDefaultTransports(), 'Returns registered default transports');
        done();
      });
    });
  });

  describe('create', function () {
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
    it('configures label', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        services.loggerFactory.setDefaultTransports({
          console: {}
        });
        var logger1 = services.loggerFactory.create('category 2', 'category-2-prefix');
        assert(logger1.transports.console.label === 'category-2-prefix', 'Console transport has correct label');
        done();
      });
    });
    it('respects specified additional transports', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {
        var winston = require('winston');
        var loggerTransportRegistry = services.loggerTransportRegistry;
        var WinstonRaygun = require('winston-raygun');
        services.loggerFactory.setDefaultTransports({
          console: {}
        });
        loggerTransportRegistry.register(WinstonRaygun, {
          apiKey: 'foobar'
        });
        var logger1 = services.loggerFactory.create('something-3', 'something-3-prefix', {
          raygun: {
            apiKey: 'foobar'
          }
        });
        assert(logger1.transports.console instanceof winston.transports.Console, 'Logger has console transport');
        assert(logger1.transports.raygun instanceof WinstonRaygun, 'Logger has raygun transport');
        assert(logger1.transports.raygun.apiKey === 'foobar', 'Raygun transport has api key');
        done();
      });
    });

    it('chains labels onto parent\'s prefix', function (done) {

      require('./../index.js')(pluginMeta, {}, function (err, services) {

        var loggerTransportRegistry = services.loggerTransportRegistry;
          loggerTransportRegistry.register(require('winston-raygun'), {
            apiKey: 'foobar'
        });

        services.loggerFactory.setDefaultTransports({
          console: {},
          file: {
            filename: 'foobar'
          },
          raygun: {
            apiKey: 'foo'
          }
        });

        var logger1 = services.loggerFactory.create('someParentLogger', 'parentprefix');
        var logger2 = logger1.createChild('prefix2');
        assert(logger2.transports.console.label === 'parentprefix:prefix2',
          'Prefix chained to parent for console transport');
        assert(logger2.transports.file.label === 'parentprefix:prefix2', 'Prefix chained to parent for file transport');
        done();
      });
    });
    it('removes specified container', function (done) {
      require('./../index.js')(pluginMeta, {}, function (err, services) {

        var loggerTransportRegistry = services.loggerTransportRegistry;
        loggerTransportRegistry.register(require('winston-raygun'), {
          apiKey: 'foobar'
        });

        var logger1 = services.loggerFactory.create('abc1', 'something-prefix', {
          file: {
            filename: 'somefile.log'
          }
        });
        assert(logger1.destroy instanceof Function, 'Logger exposes destroy method');
        assert(services.loggerContainer.loggers.abc1, 'Logger exists before destroyed');
        logger1.destroy();

        services.loggerFactory.create('abc1', 'something-totally-new-prefix', {
          file: {
            filename: 'somefile.log'
          },
          raygun: {}
        });
        assert(services.loggerContainer.loggers.abc1, 'Logger exists before destroyed');
        assert(services.loggerContainer.loggers.abc1.transports.file.filename, 'somefile.log');
        services.loggerFactory.destroy('abc1');
        assert(!services.loggerContainer.loggers.abc1, 'Logger destroyed');
        done();
      });
    });
  });
});

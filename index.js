'use strict';

var assert = require('assert');
var merge = require('merge');
var winston = require('winston');
var upperCaseFirst = require('upper-case-first');
var camelCase = require('camel-case');

module.exports = function setup(options, imports, register) {

  function addLabel(transports, label) {
    var transportName;

    if (!label) {
      return transports;
    }

    for (transportName in transports) {
      if (!transports.hasOwnProperty(transportName)) {
        continue;
      }
      if (label) {
        transports[transportName].label = label;
      }
    }
    return transports;
  }


  /**
   * Build an array of transports from config that resembles:
   * [
   *   new (winston.transports.Console)(config.Console),
   *   // example: { level: 'debug' }),
   *   new (winston.transports.File)(config.File)
   *   // example: { filename: path.join(__dirname, '/../../logs/app.log') })
   * ]
   * @param  {object<string,object>} transports - an objects keyed by tranport name with configuration
   * @param  {string} label                     - (optional) label to be added to all transports [default=false]
   * @return {array<Transport>}                 - an array of winston Transport objects
   */
  function buildTransports(transports, label) {
    var transport, transportName, transportNameUC, result = [];

    // clone, so we don't overwrite defaults
    transports = merge(true, transports);

    for (transportName in transports) {
      if (!transports.hasOwnProperty(transportName) || '_merge' === transportName) {
        continue;
      }

      transportNameUC = upperCaseFirst(transportName);

      if (!winston.transports[transportNameUC]) {
        console.error(
          'WARNING: winston logging configuration specifies undefined transport `%s` which will be ignored',
          transportName);
        continue;
      }

      if (label) {
        transports[transportName].label = label;
      }

      transport = new(winston.transports[transportNameUC])(transports[transportName]);
      result.push(transport);
    }

    return result;
  }

  function LoggerFactory(container, defaultTransports) {
    this.container = container;
    this.defaultTransports = defaultTransports;
  }

  LoggerFactory.prototype.create = function (category, label, transports) {
    var factory = this;

    var transportOptions = merge(true, this.defaultTransports),
      logger;
    if (!category) {
      throw new Error('Must provide a category for new logger creation as first argument');
    }

    transportOptions = merge(transportOptions, transports);

    this.container.add(category, addLabel(transportOptions, label));
    logger = this.container.get(category);

    logger.label = label;
    logger.category = category;

    logger.destroy = function () {
      factory.container.close(category);
    };

    logger.createChild = function (label) {
      var category = camelCase(this.category + label);
      return factory.create(category, this.label + ':' + label);
    };

    return logger;
  };

  LoggerFactory.prototype.destroy = function (category) {
    if (!category) {
      throw new Error('Must provide a category for new logger creation as first argument');
    }
    return this.container.close(category);
  };

  LoggerFactory.prototype.get = function (category) {
    return this.container.get(category);
  };

  var logger,
    loggerFactory,
    loggerContainer;

  try {

    assert(options, 'The first argument must be an options object');
    assert(options instanceof Object, 'The first argument must be an options object');
    assert(register instanceof Function, 'The third argument must be a callback');

    loggerContainer = new winston.Container();

    logger = new winston.Logger({
      transports: buildTransports(options.transports)
    });

    loggerFactory = new LoggerFactory(loggerContainer, options.transports);

  } catch (err) {
    register(err, null);
    return;
  }

  register(null, {
    logger: logger,
    loggerContainer: loggerContainer,
    loggerFactory: loggerFactory
  });
};

'use strict';

var assert = require('assert');
var errors = require('common-errors');
var merge = require('merge');
var winston = require('winston');
var upperCaseFirst = require('upper-case-first');
var camelCase = require('camel-case');

module.exports = function setup(options, imports, register) {

  var loggerTransportRegistry,
    loggerFactory,
    loggerContainer;

  try {
    assert(options, 'The first argument must be an options object');
    assert(options instanceof Object, 'The first argument must be an options object');
    assert(register instanceof Function, 'The third argument must be a callback');
  } catch (err) {
    register(err);
    return;
  }

  // add the given label as an option for the entire transports object
  function addLabelToAll(transports, label) {
    var transportName;

    if (!label) {
      return;
    }

    for (transportName in transports) {
      if (!transports.hasOwnProperty(transportName)) {
        continue;
      }
      if (label) {
        transports[transportName].label = label;
      }
    }
  }

  /**
   * Registry for types of transports and defaults
   *
   * @type {LoggerTransportRegistry}
   *
   * @property {object<string, Transport>} transports   - Registered transports
   * @property {object<string, object>} defaultOptions  - Defaults for each transport type
   */
  loggerTransportRegistry = {

    transports: {},
    defaultOptions: {},

    /**
     * Register the given transport for use by the transport factory
     *
     * @param  {Transport} transport   - A valid winston Transport
     * @param  {object} defaultOptions - (optional) Default options for the transport type
     */
    register: function (transport, defaultOptions) {
      this.transports[transport.prototype.name] = transport;
      this.defaultOptions[transport.prototype.name] = defaultOptions || {};
    },

    /**
     * Get the transport object of the given type
     * @param  {string} transportName  - The transport name
     * @return {Transport}             - The transport object
     */
    get: function (transportName) {
      var Transport, nameUC;

      Transport = this.transports[transportName];
      if (Transport) {
        return Transport;
      }

      nameUC = upperCaseFirst(transportName);

      Transport = this.transports[nameUC];
      if (Transport) {
        return Transport;
      }

      Transport = winston.transports[nameUC];
      if (Transport) {
        return Transport;
      }

      throw new errors.NotSupportedError('No transport named `' + transportName + '` exists (did you register it?)');
    },

    /**
     * Build the transport of the given type with specified options
     *
     * @param  {string} transportName - The transport type to build
     * @param  {object} options       - The options for the new transport instnace
     * @return {Transport}            - New winston Transport instance
     */
    build: function (transportName, options) {
      options = options || {};
      var Transport = this.get(transportName),
        defaultOptions = this.defaultOptions[transportName];
      return new Transport(merge(defaultOptions, options));
    },

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
    buildAll: function (transports, label) {
      var transportName, result = {};

      // clone, so we don't overwrite defaults
      transports = merge(true, transports);
      addLabelToAll(transports, label);

      for (transportName in transports) {

        if (!transports.hasOwnProperty(transportName)) {
          continue;
        }

        if (label) {
          transports[transportName].label = label;
        }

        result[transportName] = this.build(transportName, transports[transportName]);
      }

      return result;
    }
  };

  loggerContainer = new winston.Container();

  /**
   * Builds new loggers with some extra sauce around them
   *
   * @type {LoggerFactory}
   * @property {object} defaultTransports
   */
  loggerFactory = {

    defaultTransports: {},

    /**
     * Set the default transports
     * @param {object<string, objecT>} defaultTransports - Default transports to be used by all transports
     */
    setDefaultTransports: function (defaultTransports) {
      this.defaultTransports = defaultTransports;
    },

    /**
     * Get the default transports
     * @return {object<string, object>}
     */
    getDefaultTransports: function () {
      return this.defaultTransports;
    },

    /**
     * Create a logger with the specified label
     *
     * @param  {string} category                    - Unique category to name this logger
     * @param  {string} label                       - Label to prefix on all transports
     * @param  {object<string, object>} transports  - Transports to override configured defaults
     * @return {Transport}                          - Instance of created transport
     */
    create: function (category, label, transports) {

      if (!category) {
        throw new Error('Must provide a category for new logger creation as first argument');
      }

      var factory = this,
        transportOptions = merge(true, this.defaultTransports),
        logger;

      transportOptions = merge(transportOptions, transports || {});
      addLabelToAll(transportOptions, label);

      // var builtTransports = loggerTransportRegistry.buildAll(transportOptions, label);

      loggerContainer.add(category, transportOptions);
      logger = loggerContainer.get(category);

      logger.label = label;
      logger.category = category;

      logger.destroy = function () {
        loggerContainer.close(category);
      };

      logger.createChild = function (label) {
        var category = camelCase(this.category + label);
        return loggerFactory.create(category, this.label + ':' + label);
      };

      return logger;
    },

    destroy: function (category) {
      if (!category) {
        throw new Error('Must provide a category for new logger creation as first argument');
      }
      return loggerContainer.close(category);
    },

    get: function (category) {
      return loggerContainer.get(category);
    }

  };

  register(null, {
    loggerContainer: loggerContainer,
    loggerFactory: loggerFactory,
    loggerTransportRegistry: loggerTransportRegistry
  });
};

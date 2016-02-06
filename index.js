'use strict';

var assert = require('assert');
var winston = require('winston');

module.exports = function setup(options, imports, register) {

  var transportName,
    transports = [],
    logger;

  try {

    assert(options, 'The first argument must be an options object');
    assert(options instanceof Object, 'The first argument must be an options object');
    assert(register instanceof Function, 'The third argument must be a callback');

    // build an array of transports from config that resembles:
    // [
    //    new (winston.transports.Console)(config.Console),
    //    // example: { level: 'debug' }),
    //    new (winston.transports.File)(config.File)
    //    // example: { filename: path.join(__dirname, '/../../logs/app.log') })
    // ]
    for (transportName in options.transports || {}) {

      if (!options.transports.hasOwnProperty(transportName) || '_merge' === transportName) {
        continue;
      }

      if (!winston.transports[transportName]) {
        console.warn(
          'WARNING: winston logging configuration specifies undefined transport `%s` which will be ignored',
          transportName);
        continue;
      }

      transports.push(new winston.transports[transportName](options.transports[transportName]));
    }

    logger = new(winston.Logger)({
      transports: transports
    });
    
  } catch (err) {
    register(err, null);
    return;
  }

  register(null, {
    logger: logger
  });
};

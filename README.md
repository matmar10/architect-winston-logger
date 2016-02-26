# architect-winston-logger

Wrapper for using winston as an architect plugin

Prerequisites
----

* Include this package as an architect plugin in your application.
* Inject `loggerFactory` by declaring it in the `consumes` array of one of your plugins


Usage

```

module.exports = function (options, imports) {
  var loggerA = imports.loggerFactory.create('loggerA', 'task1');

  loggerA.log('info', 'Something wrong');
  // info: [task1] Something wrong

  var loggerB = loggerA.createChild('subtask2');
  loggerB.log('info', 'Something else');
  // info: [task1:subtask2] Something else

  loggerB.destroy();

};

```

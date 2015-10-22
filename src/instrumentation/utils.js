module.exports = {

  wrapMethod: function (fn, before, after, context) {
    return function opbeatInstrumentationWrapper () {
      var args = Array.prototype.slice.call(arguments)

      // Before
      var beforeData = before.apply(this, [context].concat(args))

      if(beforeData.args) {
        args = beforeData.args
      }

      // Middle
      var result = fn.apply(this, args)

      // After + Promise handling
      if (result && typeof result.then === 'function') {
        result.finally(function () {
          after.apply(this, [context].concat(args))
        }.bind(this))
      } else {
        after.apply(this, [context].concat(args))
      }

      return result
    }
  },

  instrumentMethod : function (module, fn, transaction, type, options) {
    options = options || {}
    var ref
    var nameParts = []

    if(options.prefix) {
      nameParts.push(options.prefix)
    }
    if(fn) {
      nameParts.push(fn)
    }

    var name = nameParts.join('.')

    if (options.instrumentModule) {
      ref = module
    } else {
      ref = module[fn]
    }

    var context = {
      traceName: name,
      traceType: type,
      options: options,
      fn: fn,
      transaction: transaction
    }

    var wrappedMethod = this.wrapMethod(ref, instrumentMethodBefore, instrumentMethodAfter, context)
    wrappedMethod.original = ref

    if (options.override) {
      module[fn] = wrappedMethod
    }

    return wrappedMethod
  },

  instrumentModule : function (module, $injector, options) {
    options = options || {}
    var that = this;

    var $rootScope = $injector.get('$rootScope')
    var $location = $injector.get('$location')

    var wrapper = function () {
      var fn = module
      var args = Array.prototype.slice.call(arguments)
      var transaction = $rootScope._opbeatTransactions && $rootScope._opbeatTransactions[$location.absUrl()]
      if (transaction) {
        fn = that.instrumentMethod(module, '', transaction, options.type, {
          prefix: options.prefix,
          override: false,
          instrumentModule: true,
          signatureFormatter: options.signatureFormatter,
        })
      }

      return fn.apply(module, args)
    }

    // Instrument static functions
    this.getObjectFunctions(module).forEach(function (funcScope) {
      wrapper[funcScope.property] = function () {
        var fn = funcScope.ref
        var args = Array.prototype.slice.call(arguments)
        var transaction = $rootScope._opbeatTransactions && $rootScope._opbeatTransactions[$location.absUrl()]
        if (transaction) {
          fn = that.instrumentMethod(module, funcScope.property, transaction, options.type, {
            prefix: options.prefix,
            override: true,
            signatureFormatter: options.signatureFormatter
          })
        }

        return fn.apply(module, args)
      }
    })

    return wrapper
  },

  instrumentObject : function (object, $injector, options) {
    options = options || {}
    var $rootScope = $injector.get('$rootScope')
    var $location = $injector.get('$location')

    // Instrument static functions
    this.getObjectFunctions(object).forEach(function (funcScope) {
      var transaction

      if(options.transaction) {
        transaction = options.transaction
      } else {
        transaction = $rootScope._opbeatTransactions && $rootScope._opbeatTransactions[$location.absUrl()]
      }

      if (transaction) {
        this.instrumentMethod(object, funcScope.property, transaction, options.type, {
          prefix: options.prefix,
          override: true,
          signatureFormatter: options.signatureFormatter
        })
      }
    }.bind(this))

    return object
  },

  uninstrumentMethod: function (module, fn) {
    var ref = module[fn]
    if (ref.original) {
      module[fn] = ref.original
    }
  },

  getObjectFunctions: function (scope) {
    return Object.keys(scope).filter(function (key) {
      return typeof scope[key] === 'function'
    }).map(function (property) {
      var ref = scope[property]
      return {
        scope: scope,
        property: property,
        ref: ref
      }
    })
  },

  getControllerInfoFromArgs: function (args) {
    var scope, name

    if (typeof args[0] === 'string') {
      name = args[0]
    } else if (typeof args[0] === 'function') {
      name = args[0].name
    }

    if (typeof args[1] === 'object') {
      scope = args[1].$scope
    }

    return {
      scope: scope,
      name: name
    }
  }

}


function instrumentMethodBefore (context) {

  var args = Array.prototype.slice.call(arguments).slice(1)
  var name = context.traceName;
  var transaction = context.transaction

  if(context.options.signatureFormatter) {
    name = context.options.signatureFormatter.apply(this, [context.fn, args])
  }

  var trace = transaction.startTrace(name, context.traceType)
  context.trace = trace

  return {
    args: args
  }

}

function instrumentMethodAfter (context) {
  if (context.trace) {
    context.trace.end()
  }
}



var utils = require('../utils')

module.exports = function ($provide, traceBuffer) {
  // HTTP Instrumentation
  $provide.decorator('$http', ['$delegate', '$injector', function ($delegate, $injector) {
    return utils.instrumentModule($delegate, $injector, {
      type: 'ext.$http',
      prefix: '$http',
      signatureFormatter: function (key, args) {
        var text = []
        if (args.length) {
          if (typeof args[0] === 'object') {
            text = ['$http', args[0].method.toUpperCase(), args[0].url]
          } else {
            text = ['$http', args[0]]
          }
        }
        return text.join(' ')
      }
    })
  }])
}
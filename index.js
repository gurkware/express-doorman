const Doorman = require('./lib/Doorman')

let instance = null

function createInstance (rights = [], options = {}) {
  instance = new Doorman(rights, options)
  return instance
}


module.exports = instance || createInstance()

class Doorman {
  constructor (rights, options = defaultOptions) {
    this.rights = rights
    this.rightsMap = this.generateRightsMap(rights)
    this.options = options
    this.hasRight = hasRight.bind(this)
    this.getOptions = this.getOptions.bind(this)
  }

  generateRightsMap() {

    return {}
  }

  setOptions (options) {
    this.options = options
  }

  getOptions () {
    return this.options
  }
}

const defaultOptions = {
  user: 'user', // -> req.user
  user_rights: 'rights', // -> req.user.rights
  user_id: 'id', // -> req.user.id

  entity: null,
  entity_scope: null,
  entity_id: null,

  needed_right: null
}

const hasRight  = (route_options = {}) => (req, res, next) => {
  let options = Object.assign({}, this.options, route_options)
  let userRights = req[options.user][options.user_rights]
  let userId = req[options.user][options.user_id]

  if (options.needed_right) {

  }

  return next()
}


module.exports = Doorman
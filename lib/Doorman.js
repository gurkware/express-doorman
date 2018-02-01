class Doorman {
  constructor (rights, options = defaultOptions) {
    this.rights = rights
    this.rightsMap = this.generateRightsMap(rights)
    this.options = options
    this.hasRight = hasRight.bind(this)
    this.getOptions = this.getOptions.bind(this)
  }

  generateRightsMap(rights) {
    //https://git.gurkware.de/gurkware/timetracking/blob/master/src/db/globalPermissions.js
    let rightsMap = {}
    rights.forEach(rightsArray => {
      if (!Array.isArray(rightsArray)) throw new Error('Rights have to be of Type Array')
      if (rightsMap[rightsArray[0]]) throw new Error('Duplicate definition')

      // add to map
      rightsMap[rightsArray[0]] = rightsArray.slice(1)

      //cyclic check
      let isCyclic = rightsArray.slice(1).filter(right => {
        if (rightsMap[right]){
          return rightsMap[right].filter(child => child === rightsArray[0])
        } else {
          return false
        }
      }).length !== 0
      if (isCyclic) throw new Error('Cyclic rights, are not allowed')
    })
    let changed = false
    while (changed) {

    }
    return rightsMap
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
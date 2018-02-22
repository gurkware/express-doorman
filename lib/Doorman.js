class Doorman {
  constructor () {
    this.rights = null
    this.rightsMap = null
    this.options = null
    this.checkRight = this.checkRight.bind(this)
    this.hasRight = this.hasRight.bind(this)
    this.getOptions = this.getOptions.bind(this)
    this.setOptions = this.setOptions.bind(this)
    this.setRights = this.setRights.bind(this)
    this.initialize = this.initialize.bind(this)
  }

  initialize (rights = [], options = {}) {
    this.rights = rights
    this.rightsMap = generateRightsMap(rights)
    this.options = Object.assign({}, defaultOptions, options)
  }

  setRights (rights) {
    this.rights = rights
    this.rightsMap = generateRightsMap(rights)
  }

  setOptions (options) {
    this.options = options
  }

  getOptions () {
    return this.options
  }

  checkRight (rights, neededRight) {
    return rights.filter(right =>
      right === neededRight||
      this.rightsMap[right]
        .find(_right => _right === neededRight)
    ).length !== 0
  }

  hasRight (route_options = {}) {
    return (req, res, next) => {
      let options = Object.assign({}, this.options, route_options)
      let userRights = req[options.user][options.user_rights]
      let userId = req[options.user][options.user_id]
      let rightFound = false

      if (options.needed_right) {
        rightFound = this.checkRight(userRights, options.needed_right)
        if (rightFound) {} else {
          return options.on_needed_right_fail(options.needed_right, req, res, next)
        }
      }
      if (options.entity_id && options.entity) {
        let entityField = req[options.entity]
        if (options.entity_scope) {
          let scopes = options.entity_scope.split('.')
          for (let scope of scopes) {
            entityField = entityField[scope]
          }
        }
        entityField = entityField[options.entity_id]
        let isMemberOrOwner
        if (Array.isArray(entityField)) {
          isMemberOrOwner = !!entityField.find(id => id === userId)
        } else {
          isMemberOrOwner = entityField === userId
        }
        if (!rightFound && !isMemberOrOwner) {
          return options.on_needed_right_fail('OWNER_OR_MEMBER', req, res, next)
        }
      }

      return next()
    }
  }
}

const defaultOptions = {
  user: 'user', // -> req.user
  user_rights: 'rights', // -> req.user.rights
  user_id: 'id', // -> req.user.id

  entity: null, //requestObject
  entity_scope: null,
  entity_id: null, // id -> req.requestObject.id

  needed_right: null,
  on_needed_right_fail: (missingRight, req, res, next) => {
    res.status(403).send(`User is missing right ${missingRight} to do this`)
  }
}

function isCyclic (rightsMap, rightsArray) {
  let [parentRight, ...childrenRights] = rightsArray
  return childrenRights.filter(right => {
    if (rightsMap[right]) {
      return rightsMap[right].filter(child => child === parentRight).length !== 0
    } else {
      return false
    }
  }).length !== 0
}

function generateRightsMap (rights) {
  let rightsMap = {}
  rights.forEach(rightsArray => {
    if (!Array.isArray(rightsArray)) throw new Error('Rights have to be of Type Array')
    if (rightsMap[rightsArray[0]]) throw new Error('Duplicate definition')

    // add to map
    rightsMap[rightsArray[0]] = rightsArray.slice(1)

    //cyclic check
    if (isCyclic(rightsMap, rightsArray)) throw new Error('Cyclic rights, are not allowed')
  })
  let changed = true
  while (changed) {
    changed = false
    let rightsMapCopy = Object.assign({}, rightsMap)
    for (let right in rightsMap) {

      rightsMap[right].forEach(rightChild => {
        if (rightsMap[rightChild]) {} else {
          rightsMapCopy[rightChild] = []
          changed = true
          return
        }
        rightsMapCopy[right] = [...(new Set([...rightsMapCopy[right], ...rightsMapCopy[rightChild]]))]
        changed = changed || rightsMapCopy[right].length !== rightsMap[right].length
      })
      if (isCyclic(rightsMap, [right, ...rightsMapCopy[right]])) throw new Error('Cyclic rights, are not allowed')
    }
    rightsMap = rightsMapCopy
  }
  return rightsMap
}

module.exports = Doorman

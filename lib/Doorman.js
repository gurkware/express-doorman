class Doorman {
  constructor (rights, options = defaultOptions) {
    this.rights = rights
    this.options = options
    this.hasRight = this.hasRight.bind(this)
    this.getOptions = this.getOptions.bind(this)
    this.setOptions = this.setOptions.bind(this)

    this.rightsMap = generateRightsMap(rights)
  }

  setOptions (options) {
    this.options = options
  }

  getOptions () {
    return this.options
  }
  hasRight(route_options = {}) {
    return (req, res, next) => {
      let options = Object.assign({}, this.options, route_options)
      let userRights = req[options.user][options.user_rights]
      let userId = req[options.user][options.user_id]

      if (options.needed_right) {
        let rightFound = userRights
          .filter(userRight =>
            userRight === options.needed_right ||
            this.rightsMap[userRight]
              .find(right => right === options.needed_right)
          ).length !== 0
        if (rightFound){}else{
          return options.on_needed_right_fail(options.needed_right, req, res, next)
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

  entity: null,
  entity_scope: null,
  entity_id: null,

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
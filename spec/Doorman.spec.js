describe('Doorman', () => {
  const Doorman = require('../lib/Doorman')
  const MockExpressResponse = require('mock-express-response')

  describe('rightsMap', () => {
    let door
    beforeEach(() => {
      door = new Doorman()
    })
    it('should give empty rights', () => {
      door.initialize([])
      expect(door.rightsMap).toEqual({})
    })
    it('should throw error on cyclic rights', () => {
      expect(() => {door.initialize([['1', '2'], ['2', '1']])})
        .toThrow(new Error('Cyclic rights, are not allowed'))
    })
    it('should throw error on nested cyclic rights', () => {
      expect(() => {door.initialize([['1', '2'], ['2', '3'], ['3', '1']])})
        .toThrow(new Error('Cyclic rights, are not allowed'))
    })
    it('should throw error on non array definition', () => {
      expect(() => {door.initialize(['1', ['2', '1']])})
        .toThrow(new Error('Rights have to be of Type Array'))
    })
    it('should throw error on non array definition', () => {
      expect(() => {door.initialize([['2', '1'], ['2', '1']])})
        .toThrow(new Error('Duplicate definition'))
    })
    it('should parse nesting', () => {
      door.initialize([['1', '2'], ['2', '3']])
      expect(door.rightsMap).toEqual({
        '1': ['2', '3'],
        '2': ['3'],
        '3': []
      })
    })
  })

  describe('hasRight', () => {
    let rights, doorman, expressUtils

    beforeEach(() => {
      rights = [['1', '2'], ['2', '3'], ['a', 'b', '3'], ['b', 'c']]
      doorman = new Doorman()
      doorman.initialize(rights)

      expressUtils = {
        res: new MockExpressResponse(),
        req: {
          user: {
            id: 1,
            rights: []
          },
          entity: {
            ownerId: 1,
            groupMembers: [1, 2, 3, 4],
            nested: {
              nest: {
                id: 1
              }
            }
          }
        },
        next: () => {}
      }
    })
    it('call next if user has the needed right', () => {
      spyOn(expressUtils, 'next')

      expressUtils.req.user.rights = ['1']
      doorman.hasRight({needed_right: '1'})(expressUtils.req, expressUtils.res, expressUtils.next)

      expect(expressUtils.next).toHaveBeenCalled()
    })
    it('call next if user inherits the needed right', () => {
      spyOn(expressUtils, 'next')

      expressUtils.req.user.rights = ['1']
      doorman.hasRight({needed_right: '3'})(expressUtils.req, expressUtils.res, expressUtils.next)

      expect(expressUtils.next).toHaveBeenCalled()
    })
    it('should use user fail function if right is not given', () => {
      spyOn(doorman.options, 'on_needed_right_fail')

      expressUtils.req.user.rights = ['1']
      doorman.hasRight({needed_right: 'a'})(expressUtils.req, expressUtils.res, expressUtils.next)

      expect(doorman.options.on_needed_right_fail).toHaveBeenCalled()
    })

    it('check if user is owner', () => {
      spyOn(expressUtils, 'next')
      spyOn(doorman.options, 'on_needed_right_fail')
      doorman.hasRight({entity: 'entity', entity_id: 'ownerId'})(expressUtils.req, expressUtils.res, expressUtils.next)
      expect(expressUtils.next).toHaveBeenCalled()

      expressUtils.req.user.id = 2
      doorman.hasRight({entity: 'entity', entity_id: 'ownerId'})(expressUtils.req, expressUtils.res, expressUtils.next)
      expect(doorman.options.on_needed_right_fail).toHaveBeenCalled()

    })
    it('check if user is in array', () => {
      spyOn(expressUtils, 'next')
      spyOn(doorman.options, 'on_needed_right_fail')

      doorman.hasRight({entity: 'entity', entity_id: 'groupMembers'})(expressUtils.req, expressUtils.res, expressUtils.next)
      expect(expressUtils.next).toHaveBeenCalled()

      expressUtils.req.user.id = 5
      doorman.hasRight({entity: 'entity', entity_id: 'groupMembers'})(expressUtils.req, expressUtils.res, expressUtils.next)
      expect(doorman.options.on_needed_right_fail).toHaveBeenCalled()

    })
    it('check nested user id', () => {
      spyOn(expressUtils, 'next')
      spyOn(doorman.options, 'on_needed_right_fail')

      doorman.hasRight({entity: 'entity', entity_scope: 'nested.nest', entity_id: 'id'})(expressUtils.req, expressUtils.res, expressUtils.next)
      expect(expressUtils.next).toHaveBeenCalled()

      expressUtils.req.user.id = 5
      doorman.hasRight({entity: 'entity', entity_scope: 'nested.nest', entity_id: 'id'})(expressUtils.req, expressUtils.res, expressUtils.next)
      expect(doorman.options.on_needed_right_fail).toHaveBeenCalled()
    })
  })
})
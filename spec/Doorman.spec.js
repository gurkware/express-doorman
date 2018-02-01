describe('Doorman', () => {
  const Doorman = require('../lib/Doorman')

  describe('rightsMap', () => {

    it('should give empty rights', () => {
      let door = new Doorman([])
      expect(door.rightsMap).toEqual({})
    })
    it('should throw error on cyclic permissions', () => {
      expect(() => {new Doorman([['1', '2'], ['2', '1']])})
        .toThrow(new Error('Cyclic permissions, are not allowed'))
    })
    it('should parse nesting', () => {
      let door = new Doorman([['1', '2'], ['2', '3']])
      expect(door.rightsMap).toEqual({
        '1': ['2', '3'],
        '2': ['3'],
        '3': []
      })
    })
  })
})
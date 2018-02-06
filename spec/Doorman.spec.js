describe('Doorman', () => {
  const Doorman = require('../lib/Doorman')

  describe('rightsMap', () => {

    it('should give empty rights', () => {
      let door = new Doorman([])
      expect(door.rightsMap).toEqual({})
    })
    it('should throw error on cyclic rights', () => {
      expect(() => {new Doorman([['1', '2'], ['2', '1']])})
        .toThrow(new Error('Cyclic rights, are not allowed'))
    })
    it('should throw error on nested cyclic rights', () => {
      expect(() => {new Doorman([['1', '2'], ['2', '3'], ['3', '1']])})
        .toThrow(new Error('Cyclic rights, are not allowed'))
    })
    it('should throw error on non array definition', () => {
      expect(() => {new Doorman(['1', ['2', '1']])})
        .toThrow(new Error('Rights have to be of Type Array'))
    })
    it('should throw error on non array definition', () => {
      expect(() => {new Doorman([['2', '1'], ['2', '1']])})
        .toThrow(new Error('Duplicate definition'))
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
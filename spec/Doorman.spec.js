describe('Doorman', () => {
  const Doorman = require('../lib/Doorman')

  describe('rightsMap', () => {

    it('should give empty rights', () => {
      let door = new Doorman([])
      expect(door.rightsMap).toEqual({})
    })
  })
})
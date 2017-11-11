import results from '../../src/core/results'
import {initGame} from '../../src/core'
import _ from 'lodash'
import * as chai from 'chai'

describe('core', ()=> {
  describe('results', ()=> {
    it('should give proper results', ()=> {
      const {chips} = initGame();
      const cell = _.find(chips, {type: 'ship', owner: 0}).cell;
      chai.assert(results(chips)[0] === 0);
      const newChips = _.map(chips, chip => {
        if (chip.type !== 'coin') return chip;
        return Object.assign({}, chip, {cell});
      })
      const res = results(newChips)[0]
      chai.assert( res === 35, `actual ${res}`)
    })
  })
});

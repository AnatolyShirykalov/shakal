import * as chai from 'chai'
import Arrow from '../src/core/Arrow'
import _ from 'lodash'

describe('core', ()=> {
  describe('Arrow', ()=> {
    const id = 50;
    it('should give information about available movements', ()=> {
      [1, 2, 4, 8].forEach((level)=>{
        const arrow = new Arrow({id, level});
        chai.assert(arrow.canMoveTo().length === level, `level: ${level}, length: ${arrow.canMoveTo().length}`);
        chai.assert(arrow.mustMoveTo() === ((level===1) && 37), `must: ${arrow.mustMoveTo()}, expected: ${((level===1) && 37)}`);
      })
    })

    it('should use direction parameter', ()=> {
      const cells = _.times(8).map((direction)=>new Arrow({id, direction, level: 1}).mustMoveTo());
      chai.assert(_.uniq(cells).length === 8);
    })
  })
})

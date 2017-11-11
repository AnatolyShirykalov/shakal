import Moves from '../src/core/Moves'
import {mod, toXY} from '../src/core/Moves'
import {desk, chips} from '../src/core'
import _ from 'lodash'

import * as chai from 'chai'

describe('Moves', () => {
  describe('mod', () => {
    it('should do what normal % must', () => {
      _.times(13, j=>{
        const i = j + 1;
        chai.assert(mod(-i,13) === 13 - i, `result: ${mod(-i, 13)}, expected: ${13 -i}`);
      })
    })
  })

  describe('toXY', ()=>{
    it('should convert id to XY', () => {
      for(let x = 0; x<13; x++)
        for(let y = 0; y < 13; y++) {
          const pt = toXY(13*y + x);
          chai.assert(
            pt.x === x && pt.y === y
          );
        }
    })
  })

  const dsk = desk();
  const cs = chips(dsk);
  const ships = _.groupBy(_.filter(cs, {type: 'ship'}), 'owner');
  const validateMove = move => {
    chai.assert(move.hasOwnProperty('to'), `move has not property to`);
  }
  it('should give 3 options per each chip on ship', ()=>{
    _.filter(cs, {type: 'chip'}).forEach(chip => {
      const moves = Moves(chip, dsk, ships[chip.owner][0]);
      moves.forEach(validateMove);
      chai.assert(
        moves.length === 3,
        `there are ${moves.length} moves of chip with id = ${chip.id}`
      )
    });
  });

  it('should give 2 options for ship', ()=>{
    _.filter(cs, {type: 'ship'}).forEach(ship => {
      const moves = Moves(ship, dsk, ship);
      moves.forEach(validateMove);
      chai.assert(
        moves.length === 2,
        `there are ${moves.length} moves for ship with id ${ship.id}`
      )
    })
  })

  it('should give 8 options for donkey', () => {
    const donkey = _.find(cs, {type: 'donkey'});
    const home = _.find(dsk, {type: 'donkey'});
    chai.assert(!!donkey, 'there is not donkey in the chips array');
    chai.assert(!!home, 'there is no home for donkey');
    chai.assert(donkey.cell === home.id, `donkey's home is ${donkey.cell} but cell with type 'donkey' is ${home.id}`);
    const moves = Moves(donkey, dsk);
    chai.assert(moves.length === 8, `${moves.length} for donkey`);
  })

  it('should give arrow.level options for cell in arrow', () => {
    [2, 4, 8].forEach(level => {
      const arrow = _.find(dsk, {type: 'arrow', level});
      chai.assert(!!arrow, `there is no arrow with level ${level}`);
      const moves = Moves({type: 'chip', cell: arrow.id}, dsk);
      chai.assert(moves.length === level, `moves.length: ${moves.length}, level: ${level}`);
    })
  })

  it('should move through marsh by level', () => {
    _.each(_.groupBy(_.filter(dsk, {type: 'marsh'}), 'level'), (marshes, level) => {
      const movesFrom = Moves({type: 'chip', cell: marshes[0].id, level: marshes[0].level}, dsk);
      chai.assert(movesFrom.length === 8, `there are ${movesFrom.length} moves from last level`);
      const moves = Moves({type: 'chip', cell: marshes[0].id, level: 1}, dsk);
      chai.assert(moves.length === 1, `there are ${moves.length} moves`);

    })
  })

  it('should give 2 options on water without ship and islands', () => {
    const dskWI = _.map(dsk, cell=>{
      return Object.assign({}, cell, {type: cell.type === 'island' ? 'empty' : cell.type});
    })
    const moves = Moves({id: 1, type: 'chip', cell: 1}, dskWI);
    chai.assert(moves.length === 2, `length: ${moves.length}`);
  })

  it('should give 3 options on water without ship, but near island', () => {
    const dskWI = _.map(dsk, (cell, id) => {
      if (id !== 14 ) return cell;
      return Object.assign({}, cell, {type: 'island'});
    })
    const moves = Moves({id: 1, type: 'chip', cell: 1}, dskWI);
    chai.assert(moves.length === 3, `length: ${moves.length}`);
  })

  it('should not allow move ships to corners', ()=> {
    const ship = {id: 0, type: 'ship', owner: 0, cell: 1};
    const moves = Moves(ship, dsk, ship);
    chai.assert(!_.find(moves, {to: 0}), 'allow ship move to corner');
    const chip = {id: 1, type: 'chip', owner: 0, cell: 1};
    const chipMoves = Moves(chip, dsk, ship);
    const move = _.find(chipMoves, {to: 0});
    chai.assert(move, 'not allow chip move to corner');
  })
})

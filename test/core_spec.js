import { desk, initGame, chips} from '../src/core'
import deskValidator from '../src/core/deskValidator'
import _ from 'lodash'
import * as chai from 'chai'

describe('core', () => {
  const dsk = desk();
  const cs = chips(dsk);
  const ships  = _.filter(cs, ['type', 'ship']);
  const chs    = _.filter(cs, ['type', 'chip']);
  const coins  = _.filter(cs, ['type', 'coin']);
  const friday = _.find(cs, ['type', 'friday']);
  const donkey = _.find(cs, ['type', 'donkey']);

  describe('chips', () => {

    it('should be an array of chips with types, ids and cells', () => {
      const checkField = (field) => {
        const bad = _.findIndex(cs, c=>c[field]===undefined);
        chai.assert(bad===-1, `there is a chip without a ${field} at index ${bad} with type ${cs[bad] && cs[bad].type}`);
      }
      chai.assert(Array.isArray(cs), `cs: ${cs}`);
      const bad = _.findIndex(cs, c => typeof(c)!=='object' || Array.isArray(c));
      chai.assert(bad===-1, `there is non object element in chips array ${typeof(cs[bad])} at index ${bad}`);
      ['type', 'id', 'cell'].forEach(checkField);

    })


    it('shoud be 4 ships, 12 chips, 35 coins, friday and donkey', () => {
      chai.assert(ships.length === 4, `actual ships amount is ${ships.length}`);
      chai.assert(chs.length === 12, `actual chips amount is ${chs.length}`);
      chai.assert(coins.length === 35, `actual coins amount is ${coins.length}`);
      chai.assert(!!friday, 'there is no friday');
      chai.assert(!!donkey, 'there is no donkey');
      ships.forEach(ship=>{
        const len = _.filter(chs, {owner: ship.owner, cell: ship.cell}).length;
        chai.assert( len===3, `actual number of chips on the ship with id=${ship.id} on cell=${ship.cell} is ${len}`);
      })
    })
  })

  describe('desk', () => {

    it('should be 13 x 13', () => {
      chai.assert(dsk.length === 169, 'desk size is not 13 x 13');
    })

    it('should has 48 water fields', () => {
      chai.assert(
        _.filter(dsk, {type: 'water', opened: true}).length === 48,
        'count of water fields is not 48'
      );
    })

  });

  describe('deskValidator', () => {
    it('should mark desk with 1-arrow cycle as invalid', ()=> {
      const t = {[15]: 2, [16]: 4, [29]: 6, [28]: 0}
      const bad = dsk.map((cell, id) => {
        if (!t.hasOwnProperty(id)) return cell;
        return {id, type: 'arrow', direction: t[id], level: 1};
      })
      chai.assert(!deskValidator(bad), 'it is marked as valid');
    })
  })

  describe('treasure', ()=>{
    it('should have number of coins similar to level of treasure', ()=>{
      const treasures = _.filter(dsk, ['type', 'treasure']);
      const coinCounts = _.countBy(coins, 'cell');
      treasures.forEach(treasure=>{
        const a = coinCounts[treasure.id];
        const {level, id} = treasure;
        chai.assert(level === a, `there is a treasure with id=${id}, level=${level} and ${a || 0} coins`);
      })
    })
  });

  describe('initGame', () => {
    it('should init new valid game', () => {
      _.times(20, ()=> {
        const game = initGame();
        chai.assert(Object.keys(game).length === 4);
        chai.assert(deskValidator(game.desk));
      });
    });
  });

});

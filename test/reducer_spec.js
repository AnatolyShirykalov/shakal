import { game } from '../src/reducer'
import { initGame } from '../src/core'
import * as chai from 'chai'
import Moves from '../src/core/Moves'
import _ from 'lodash'
import Arrow from '../src/core/Arrow'

describe('reducers', () => {
  describe('game', () => {
    const initialState = initGame();
    const is = _.cloneDeep(initialState);
    const str = JSON.stringify(initialState);
    it('should not change state', () => {
      let state = initialState;
      game(state, {type: 'Несуществующий action'})
      chai.assert(state === initialState)
      chai.assert(_.isEqual(initialState, is), `initial state has changed`);
    })

    describe('MOVE', () => {
      const {desk, chips, player} = initialState;
      const ship = _.find(chips, {type: 'ship', owner: player});
      it('should move chip', ()=> {
        const chip = _.find(chips, {type: 'chip', owner: player});
        Moves(chip, desk, ship).forEach(move => {
          if (desk[move.to].type === 'arrow') return;
          const state = game(initialState, {type: 'MOVE', ...move, chipIds: [chip.id]});
          chai.assert(state!==initialState, 'state did not changed');
          chai.assert(state.hasOwnProperty('chips'), `game keys: ${Object.keys(state)}`);
          const cell = state.chips[chip.id].cell;
          chai.assert(cell === move.to, `cell: ${cell}, move.to: ${move.to}; was on: ${chip.cell}`);
          chai.assert(state.desk[cell].opened, `cell ${cell} is closed`);
        })
        chai.assert(_.isEqual(initialState, is), `initial state has changed`);
      });

      it('should move ship', ()=>{
        Moves(ship, desk, ship).forEach(move => {
          const chipIds = _.map(_.filter(chips, {owner: player}), 'id');
          const state = game(initialState, {type: 'MOVE', ...move, chipIds});
          chai.assert(state != initialState, `state did not changed`);
          chipIds.forEach(id=>{
            const cell = state.chips[id].cell;
            const onearrow = (c=>c.type==='arrow' && c.level === 1)(desk[move.to]);
            chai.assert(cell === move.to || onearrow, `cell: ${cell}, move.to: ${move.to}, was on: ${ship.cell}`);
          })
        })
        chai.assert(_.isEqual(initialState, is), `initial state has changed`);
      })

      it ('should automove on 1-arrow', ()=> {
        const arrow = _.find(desk, {type: 'arrow', level: 1});
        const state = game(initialState, {type: 'MOVE', to: arrow.id, chipIds: [chips[1].id]});
        const chip = state.chips[1];
        let cell = arrow;
        for (let id = new Arrow(cell).mustMoveTo(); !!id; id = new Arrow(cell).mustMoveTo()) {
          cell = desk[id];
          if (cell.type !== 'arrow' || cell.level !== 1) break;
        }
        chai.assert(chip.cell === cell.id, `chip.cell: ${chip.cell}, cell.id: ${cell.id}`);
        chai.assert(_.isEqual(initialState, is), `initial state has changed`);
      })

      it('should move through the marsh by marsh.level steps', () => {
        _.each(_.groupBy(_.filter(desk, {type: 'marsh'}), 'level'), (marshes, level) => {
          let states = [game(initialState, {type: 'MOVE', to: marshes[0].id, chipIds: [1]})];
          _.times(level).forEach(i => {
            const {chips, desk} = states[i];
            const moves = Moves(chips[1], desk, chips[0]);
            states.push(game(
              Object.assign({}, states[i], {player: 0}),
              {type: 'MOVE', ...(moves[0]), chipIds: [1]}
            ));
            const state = states[i+1];
            const chip = states[i+1].chips[1];
            chai.assert((moves.length === 1) === (i + 1 < level));
            chai.assert(
              (chip.cell === marshes[0].id) === (i + 1 < level),
              `marsh.level: ${level}, marsh.id: ${marshes[0].id}, chip.cell: ${chip.cell}`
            );
          })

        });
        chai.assert(_.isEqual(initialState, is), `initial state has changed`);
      });

      it('should automove through vortex', () => {
        const vdesk = desk.map(cell => {
          if (cell.type!=='water' && cell.type !== 'vortex')
            return Object.assign({}, cell, {type: 'empty'});
          return cell;
        })
        const count = _.filter(vdesk, (vortex, id) => {
          if (vortex.type !== 'vortex') return false;
          const dir = _.find(
            [1, 12, 13, 14],
            i => _.filter(
              [vdesk[id+i], vdesk[id-i]],
              nei => !_.includes(['water', 'vortex'], nei.type)
            ).length === 2
          );
          if (!dir) return false;
          const stateBefore = game(
            Object.assign({}, initialState, {desk: vdesk}),
            {type: 'MOVE', to: vortex.id - dir, chipIds: [1]}
          );
          const moves = Moves(stateBefore.chips[1], stateBefore.desk);
          chai.assert(
            _.includes(_.map(moves, 'to'), vortex.id),
            `vortex.id: ${vortex.id}, moves.length:${moves.length}, typeBefore: ${stateBefore.desk[vortex.id - dir].type}`
          );
          const state = game(stateBefore, {type: 'MOVE', to: vortex.id, chipIds: [1]});
          const cell = state.chips[1].cell;
          const expected = vortex.id + dir;
          chai.assert(
            cell === expected,
            `expected: ${expected}, cell: ${cell}, was: ${stateBefore.chips[1].cell}`
          )
          return true;
        }).length;
        chai.assert(count > 0, 'cannot find suitable case to check');
        chai.assert(_.isEqual(initialState, is), `initial state has changed`);
      })

      it('should open cell', () => {
        const empty = _.find(initialState.desk, {type: 'empty'});
        const state = game(initialState, {type: 'MOVE', to: empty.id, chipIds: [1]});
        chai.assert(state.desk[empty.id].opened, 'not opened');
        chai.assert(_.isEqual(initialState, is), `initial state has changed`);
      })

      it('should knock out', () => {
        const empty = _.find(initialState.desk, {type: 'empty'});
        const mv = (s, id) => game(s, {type: 'MOVE', to: empty.id, chipIds: [id]});
        const stateBefore = mv(initialState, 1);
        const state = mv(stateBefore, 5);
        const cell = state.chips[1].cell;
        const home = state.chips[0].cell;
        const enemy = state.chips[5].cell;
        chai.assert(cell === home, `cell: ${cell}, home: ${home}, enemy: ${enemy}`);
        chai.assert(_.isEqual(initialState, is), `initial state has changed`);
      });

      it('should not try to knock out the coin', () => {
        const treasure = _.find(initialState.desk, {type: 'treasure'});
        const state1 = game(initialState, {type: 'MOVE', chipIds: [1], to: treasure.id});
        const state2 = game(state1, {type: 'MOVE', chipIds: [5], to: treasure.id});
        chai.assert(_.filter(state2.chips, {type: 'coin', cell: treasure.id}).length === treasure.level);
      })

      it('should assign owner to donkey and friday', () => {
        const donkey = _.find(initialState.desk, {type: 'donkey'});
        const state = game(
          initialState,
          {type: 'MOVE', to: donkey.id, chipIds: [1]}
        );
        const chip = _.find(state.chips, {type: 'donkey'});
        chai.assert(
          chip.owner === 0,
          `donkey.owner: ${chip.owner}`
        );
        chai.assert(_.isEqual(initialState, is), `initial state has changed`);
      })

      it('should knockOut donkey to donkey-cell', () => {
        const donkeyCell = _.find(initialState.desk, {type: 'donkey'});
        const state1 = Object.assign({}, game(
          initialState,
          {type: 'MOVE', to: donkeyCell.id, chipIds: [1]}
        ), {player: 0});
        const empty = _.find(state1.desk, {type: 'empty'});
        const donkey = _.find(state1.chips, {type: 'donkey'});
        const state2 = game(
          state1,
          {type: 'MOVE', to: empty.id, chipIds: [donkey.id]}
        );
        const state = game(
          state2,
          {type: 'MOVE', to: empty.id, chipIds: [6]}
        );
        const cell = state.chips[donkey.id].cell;
        const home = donkeyCell.id;
        chai.assert(cell === home, `cell: ${cell}, home: ${home}, empty: ${empty}`);
      });

      it('should block', () => {
        const block = _.find(desk, {type: 'block', level: 2});
        const mv = (s, c, to=block.id) => Object.assign({},
          game(s, {type: 'MOVE', to, chipIds: [c]}),
          {player: 0}
        );
        const ms = (s, id) => Moves(s.chips[id], s.desk, s.chips[0]);
        const s1 = mv(initialState, 1);
        const ms1 = ms(s1, 1);
        const s2 = mv(s1, 2);
        const ms2 = ms(s2, 2);
        const ms21 = ms(s2, 1);
        const s3 = mv(s2, 1, 0);
        const s4 = mv(s3, 2, 0);
        chai.assert(s1.desk[block.id].active, 'not active');
        chai.assert(ms1.length === 0, 'did not blocked');
        chai.assert(ms2.length > 0);
        chai.assert(ms21.length > 0);
        chai.assert(!s2.desk[block.id].active, 'not deactive');
        chai.assert(!s3.desk[block.id].active, 'active when should not');
        chai.assert(s4.desk[block.id].active, 'not active again');
      })

    });

    describe('SELECT', ()=> {
      const {desk, chips, player} = initialState;
      it('should select and deselect another', () => {
        const state = game(initialState, {type: 'SELECT', id: 1});
        chai.assert(state.chips[1].selected, 'not selecter');
        const state2 = game(state, {type: 'SELECT', id: 2});
        chai.assert(!state2.chips[1].selected && state2.chips[2].selected);
      });

      it('should toggle selected coins and drop selection from coin when you select chip on another cell', () => {
        const treasure = _.find(desk, {type: 'treasure', level: 5});
        const state1 = Object.assign(
          {},
          game(initialState, {type: 'MOVE', to: treasure.id, chipIds: [1]}),
          {player: 0}
        )
        const state2 = game(state1, {type: 'SELECT', id: 1});
        chai.assert(state2.chips[1].selected);
        const coin = _.find(chips, {type: 'coin', cell: treasure.id});
        const state3 = game(state2, {type: 'SELECT', id: coin.id});
        const s1 = state3.chips[coin.id].selected;
        const s2 = state3.chips[1].selected;
        chai.assert(s1 && s2, `${s1} ${s2}`);
        const state4 = game(state3, {type: 'SELECT', id: 2});
        const s3 = state4.chips[1].selected;
        const s4 = state4.chips[2].selected;
        const s5 = state4.chips[coin.id].selected;
        chai.assert(!s3 && s4 && !s5, `${s3}, ${s4} ${s5}`);
      })
    });
  });
});

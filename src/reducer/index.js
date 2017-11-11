import { initGame } from '../core'
import _ from 'lodash'
import Game from '../core/Game'
import { combineReducers } from 'redux'

const defaultState = initGame();
const defaultServer = {myPlayer: null, ok: false};

export const game = (state = defaultState, action) => {
  if (action.type === 'initGame') return action.game;
  if (action.type === 'SELECT'){
    const target = state.chips[action.id];
    const isCoin = target.type === 'coin';
    const isShip = target.type === 'ship';
    return Object.assign({}, state, {chips: _.map(state.chips, (chip, id) => {
      if (isShip && chip.owner === state.player && chip.cell === target.cell)
        return Object.assign({}, chip, {selected: true});
      if (id === action.id) return Object.assign({}, chip, {selected: !chip.selected});
      if (!isCoin && chip.type === 'coin' && chip.cell != target.cell)
        return Object.assign({}, chip, {selected: false});
      if (isCoin || chip.type === 'coin') return chip;
      return Object.assign({}, chip, {selected: false});
    }) });
  }
  if (action.type !== 'MOVE') return state;
  return new Game(state, action).newState();
};


const myPlayer = (state = null, action) => {
  if (action.type === 'SET_PLAYER') return action.data;
  return state;
}

const server = (state = 'new', action) => {
  if (action.type === 'server/page') return 'new';
  if (action.type.match(/^server/)) return 'pending';
  if (action.type === 'SET_PLAYER') return 'noDesk';
  if (action.type === 'initGame' || action.type === 'MOVE' || action.type === 'SELECT') return 'ok';
  return state;
}

const reducer = combineReducers({game, server, myPlayer});
export default reducer;


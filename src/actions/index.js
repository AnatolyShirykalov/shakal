import {initGame} from '../core'

export const select = (field_id, object_id) => {
  return {
    type: 'SELECT',
    field_id,
    object_id
  }
}

// from, to, object_id, with_monets
export const move = (args) => {
  return {
    type: 'MOVE',
    ...args
  }
}

export const initGAME = () => {
  return {type: 'server/initGame', game: initGame()}
}

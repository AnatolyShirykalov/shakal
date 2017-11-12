import _ from 'lodash'

export const emptyAround = (desk, pup) => {
  return _.map(desk, cell => {
    if ( _.includes(['water', pup.type], cell.type)) return cell;
    return {id: cell.id, type: 'empty', safeForCoins: true};
  });
}

export const moveFirst = (cell, coinId) => {
  return {type: 'MOVE', to: cell, chipIds: _.filter([1, coinId], a=>a)};
}

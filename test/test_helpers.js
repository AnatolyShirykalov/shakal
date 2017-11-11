import _ from 'lodash'

export const emptyAround = (desk, treasure) => {
  return _.map(desk, cell => {
    if ( _.includes(['water', 'treasure'], cell.type)) return cell;
    return {id: cell.id, type: 'empty', safeForCoins: true};
  });
}

export const moveFirst = (cell, coinId) => {
  return {type: 'MOVE', to: cell, chipIds: _.filter([1, coinId], a=>a)};
}

import Arrow from './Arrow'
import _ from 'lodash'

export const mod = (x, y) => x > 0 ? x % y : mod(x + y, y);

export const toXY = id => {
  return {x: mod(id, 13), y: (id - mod(id, 13))/13};
}

export const toId = ({x, y}) => 13 * y + x;

export const add = (a, b) => {
  return {x: a.x + b.x, y: a.y + b.y};
}

const validNeighbor = (chip, desk) => ({x, y}) =>
  x >= 0 && x < 13 && y>=0 && y < 13 &&
  (chip.type !== 'ship' || desk[toId({x,y})].type === 'water');

const cds = '0 -1 1 -1 1 0 1 1 0 1 -1 1 -1 0 -1 -1'.split(' ').map(a=>parseInt(a));
const moves = _.times(8, i=>{return {x: cds[2*i], y: cds[2*i+1]}});
const nonDiag = _.filter(moves, m=>m.x*m.y===0);

const hs = '-2 -1 -2 1 -1 -2 -1 2 1 -2 1 2 2 -1 2 1'.split(' ').map(a=>parseInt(a));
const horseMoves = _.times(8, i=>{return {x: hs[2*i], y: hs[2*i+1]}});

const digits = (chip, desk, ship={}) => {
  const ids = from => _.map(
    _.filter(
      from.map(m=>add(m, toXY(chip.cell))),
      validNeighbor(chip, desk)
    ), toId
  );
  if (chip.type === 'ship')
    return _.filter(ids(nonDiag), id=>!_.includes([0, 12, 168, 156], id));
  switch(desk[chip.cell].type) {
    case 'arrow':
      return new Arrow(desk[chip.cell]).canMoveTo();
    case 'horse':
      return ids(horseMoves);
    case 'water':
      if (ship.cell === chip.cell) return ids(nonDiag);
      return _.filter(ids(nonDiag), id=>_.includes(['water', 'island'], desk[id].type));
    case 'block':
      if (desk[chip.cell].active === false) return ids(moves);
      return [];
    default:
      return ids(moves);
  }
}

const Moves = (chip, desk, ship={}) => {
  const cell = desk[chip.cell];
  if (cell.type === 'marsh' && chip.level < cell.level)
    return [{to: cell.id, level: chip.level+1}];
  return _.map(digits(chip, desk, ship), d => {
    return {to: d};
  })
}

export default Moves;

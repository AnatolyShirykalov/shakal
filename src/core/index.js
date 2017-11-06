import _ from 'lodash'
import deskValidator from './deskValidator'

export const fields = () => { return[
  {type: 'marsh', level: 2, count: 7},
  {type: 'marsh', level: 3, count: 6},
  {type: 'marsh', level: 4, count: 5},
  {type: 'marsh', level: 5, count: 4},
  {type: 'marsh', level: 6, count: 2},
  {type: 'treasure', level: 1, count: 5},
  {type: 'treasure', level: 2, count: 4},
  {type: 'treasure', level: 3, count: 3},
  {type: 'treasure', level: 4, count: 2},
  {type: 'treasure', level: 5, count: 1},
  {type: 'arrow', level: 1, count: 8, direction: ()=>_.random(7)},
  {type: 'arrow', level: 2, count: 8, direction: ()=>_.random(3)},
  {type: 'arrow', level: 4, count: 8, direction: ()=>_.random(1)},
  {type: 'arrow', level: 8, count: 6},
  {type: 'star', count: 3, direction: ()=>_.random(3)},
  {type: 'hedgehog', count: 1}, // ёж
  {type: 'empty', count: 18},
  {type: 'horse', count: 5},
  {type: 'shark', count: 1},
  {type: 'donkey', count: 1},
  {type: 'friday', count: 1},
  {type: 'vortex', count: 5},
  {type: 'block', level: 2, count: 3, active: true},
  {type: 'block', level: 3, count: 1, active: true},
  {type: 'island', count: 13}
]}

const safeForCoins = (type) => {
  return !_.includes(['vortex', 'island'], type);
}

const internal = () => {
  return _.concat(..._.map(fields(), (field, id) => {
    return _.times(field.count, () => {
      let extra = {opened: false, safeForCoins: safeForCoins(field.type)};
      if (field.direction) extra.direction = field.direction()
      return {..._.pick(field, ['type', 'level', 'active']), ...extra}
    })
  }))
}

const shipWithChips = (cell, owner) => {
  return _.concat(
    [{type: 'ship', owner, id: owner * 4, cell: cell}],
    _.times(3, (i) => {
      return {type: 'chip', owner, id: (owner * 4) + i+1, cell}
    })
  )
}

const coins = (cell, count) => {
  let id = count;
  return _.times(cell.level, ()=>{
    return {type: 'coin', id: id++, opened: false, cell: cell.id}
  })
}

export const desk = () => {
  const inter =  _.shuffle(internal())
  const water = {type: 'water', safeForCoins: false, opened: true}
  const all =  _.concat(
       _.times(13, () => water),
    ..._.times(11, i  => [water, ..._.slice(inter, 11*i, 11*(i+1)), water]),
       _.times(13, () => water)
  )
  return _.map(all, (cell, id) => {
    return Object.assign({}, cell, {id})
  })
}

export const chips = (dsk) => {
  const treasures = _.filter(dsk, ['type', 'treasure']);
  const fridayCell = _.find(dsk, ['type', 'friday']).id;
  const donkeyCell = _.find(dsk, ['type', 'donkey']).id;
  const shipsChips = [5, 5*13, 163, 6*13-1].map(shipWithChips);
  let count = shipsChips[0].length * shipsChips.length;
  return _.concat(...shipsChips,
    [{type: 'friday', cell: fridayCell, id: count++, opened: false},
    {type: 'donkey', cell: donkeyCell, id: count++, opened: false}],
    ...treasures.map(cell => {
    const ret = coins(cell, count);
    count += ret.length;
    return ret;
  }))
}

export const initGame = () => {
  let dsk;
  for (dsk = desk(); !deskValidator(dsk); dsk = desk());
  //const opened = dsk.map(cell => {
    //return Object.assign({}, cell, {opened: true});
  //})
  return { desk: dsk, chips: chips(dsk), player: 0, results: {[0]: 0, [1]: 0, [2]: 0, [3]: 0}}
  //return { desk: opened, chips: chips(dsk), player: 0 }
}


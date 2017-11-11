import Arrow from './Arrow'
import _ from 'lodash'

const deskValidator = desk => {
  return _.filter(desk, {type: 'arrow', level: 1}).filter((arrow, i, arrows) => {
    const step = ar => _.find(arrows, {id: new Arrow(ar).mustMoveTo()});
    let all = [arrow.id];
    for(let cur = step(arrow); !!cur; cur = step(cur)){
      if (_.includes(all, cur.id)) return true;
      all.push(cur.id);
    }
    return false;
  }).length === 0;
};

export default deskValidator;

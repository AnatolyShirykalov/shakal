import Arrow from './Arrow'
import _ from 'lodash'

const deskValidator = desk => {
  return _.filter(desk, {type: 'arrow', level: 1}).filter((arrow, i, arrows) => {
    const step = ar => _.find(arrows, {id: new Arrow(ar).mustMoveTo()});
    for(let cur = step(arrow); !!cur; cur = step(cur)){
      if (cur.id === arrow.id) return true;
    }
    return false;
  }).length === 0;
};

export default deskValidator;

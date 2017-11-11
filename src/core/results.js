import _ from 'lodash'

const results = chips => {
  let ret = {};
  _.each(_.filter(chips, {type: 'ship'}), ship => {
    ret[ship.owner] = _.filter(chips, {type: 'coin', cell: ship.cell}).length;
  })
  return ret;
};

export default results;

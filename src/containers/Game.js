import React from 'react'
import Cell from '../components/Cell'
import Chip from '../components/Chip'
import Moves from '../core/Moves'
import { connect } from 'react-redux'
import _ from 'lodash'
import './game.css'
import * as actions from '../actions'

const mapStateToProps = ({server: {myPlayer, ok, pending}, game: {desk, chips, player, results}}) => {
  if (typeof(myPlayer) !== 'number') return {};
  if (!ok) return {player: myPlayer === 0 ? 0 : false};
  const selected = _.filter(chips, {selected: true});
  const mustContinue = selected.length > 0 &&
    _.includes(['arrow', 'horse'], desk[selected[0].cell].type);
  const sc = _.find(selected, {type: 'coin'});
  const ship = _.find(chips, {owner: player, type: 'ship'});
  const moves = selected.length > 0 ? Moves(selected[0], desk, ship) : [];
  return {
    selected, player, results, ok,
    desk: desk.map((cell, id) => {
      const achievable = !pending && !!_.find(moves, {to: id});
      if (!cell.opened) return {id, objects: [], achievable};
      const objects = _.map(_.filter(chips,{cell: id}), (chip, id) => {
        return Object.assign({}, chip, {
          selectable: !pending && !mustContinue && myPlayer === player && (
            (
              chip.owner === player &&
              (!chip.selected || !sc) &&
              chip.type !== 'coin'
            ) || (
              chip.type === 'coin' &&
              selected.length > 0 &&
              chip.cell === selected[0].cell &&
              chip.level === selected.level &&
              (chip.selected || !sc)
            )
          )
        });
      });
      return Object.assign({}, cell, {objects, achievable});
    })
  }
}

const mapDispatchToProps = dispatch => {
  return {
    selector: id => dispatch({type: 'server/SELECT', id}),
    mover: move => dispatch(Object.assign({}, move, {type: 'server/MOVE'})),
    initGame: () => dispatch(actions.initGAME())
  }
}


const GameComponent = ({player, ok, selected, desk, results, mover, selector, initGame}) => {
  if (!ok && typeof(player) !== 'number') return <div className="sorry">Ждём остальных</div>;
  if (!ok) return (
    <div className="push">
      <button onClick={initGame} >Создать игру</button>
    </div>
  );
  const extraChipProps = chip => {
    if (chip.selectable) return {onClick: (e) => {
      e.stopPropagation();
      return selector(chip.id);
    }};
    return {};
  }
  const extraCellProps = cell => {
    if(!cell.achievable || selected.length === 0) return {};
    const lvl = selected[0].level;
    const extra = typeof(lvl)==='number' && cell.level ? {level: lvl+ 1} : {};
    return {onClick: () =>mover({to: cell.id, ...extra, chipIds: _.map(selected, 'id')})};
  }
  return (
    <div className="shakal">
      <div className="shakal-bar">
        <div className={`bar-player player-${player}`} />
        <div className="results">
          {_.map(results, (result, pl) => {
            return (
              <div key={pl} className={`result player-${pl}`}>
                {result}
              </div>
            );
          })}
        </div>
      </div>
      <div className="desk">
        {desk.map( cell => {
          return (
            <Cell key={cell.id} {...cell} {...extraCellProps(cell)} >
              {_.map(cell.objects, chip => {
                return (<Chip key={chip.id} {...chip} {...extraChipProps(chip)} />)
              })}
            </Cell>
          )
        })}
      </div>
    </div>
  )
}

const Game = connect(mapStateToProps, mapDispatchToProps)(GameComponent);

export default Game;


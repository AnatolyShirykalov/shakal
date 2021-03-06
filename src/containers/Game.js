import React from 'react'
import Cell from '../components/Cell'
import Chip from '../components/Chip'
import Moves from '../core/Moves'
import { connect } from 'react-redux'
import _ from 'lodash'
import './game.css'
import * as actions from '../actions'
import rslts from '../core/results'
import Sync from '../components/Sync'

const mapStateToProps = ({myPlayer, server, game: {desk, chips, player}}) => {
  if (server === 'new') return {server};
  if (server !== 'ok' && server !== 'pending') return {server, myPlayer};
  const results = rslts(chips);
  const selected = _.filter(chips, {selected: true});
  const mustContinue = selected.length > 0 &&
    _.includes(['arrow', 'horse'], desk[selected[0].cell].type);
  const sc = _.find(selected, {type: 'coin'});
  const ship = _.find(chips, {owner: player, type: 'ship'});
  const moves = selected.length > 0 ? Moves(selected[0], desk, ship) : [];
  const pending = server === 'pending'
  return {
    selected, player, results, server, myPlayer, game: {desk, chips, player},
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
              (desk[chip.cell].type !=='marsh' || chip.level === selected[0].level) &&
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
    initGame: game => ()=> dispatch(actions.initGAME(game))
  }
}


const GameComponent = ({game, myPlayer, player, server, selected, desk, results, mover, selector, initGame}) => {
  if (server === 'new') return <div className="sorry">Чтобы начать игру, нужно открыть сию страницу в четырёх вкладках. После открытия четвёртой вкладки у первого открывшего появится волшебная кнопка. После нажатия кнопки сгенерируется поле и начнётся игра.</div>;
  if (server === 'noDesk')
    if (myPlayer === 0) return (
      <div className="push">
        <button onClick={initGame(game)} >Создать игру</button>
      </div>
    );
    else return <div className="sorry">Ждём первого игрока. Он должен создать поле.</div>
  const extraChipProps = chip => {
    if (chip.selectable) return {onClick: (e) => {
      e.stopPropagation();
      return selector(chip.id);
    }};
    return {};
  }
  const extraCellProps = cell => {
    if(!cell.achievable || selected.length === 0 || player !== myPlayer) return {};
    const lvl = selected[0].level;
    const extra = typeof(lvl)==='number' && cell.level ? {level: lvl+ 1} : {};
    return {onClick: () =>mover({to: cell.id, ...extra, chipIds: _.map(selected, 'id')})};
  }
  return (
    <div className="shakal">
      <div className="shakal-bar">
        <div className={`bar-player player-${player}`} >Текущий</div>
        <div className={`bar-player my-player player-${myPlayer}`} >Вы</div>
        <Sync {...{sendGame: initGame(game), myPlayer}}/>
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


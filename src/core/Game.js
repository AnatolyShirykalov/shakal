import _ from 'lodash'
import Arrow from './Arrow'

export default class Game {
  constructor(state, action) {
    ['player', 'chips', 'desk', 'results'].forEach(k=>this[k]=state[k]);
    ['to', 'chipIds', 'level'].forEach(k=>this[k]=action[k]);
    this.toCell = _.find(this.desk, ['id', this.to]);
    if (this.toCell.type === 'marsh' && this.chips[this.chipIds[0]].cell !== this.to) this.level = 1;
  }

  // вышибаем
  knockOut(chip, id) {
    if(!this.toCell.opened || chip.type === 'coin' || chip.cell !== this.to || chip.level != this.level || chip.owner === this.player || this.toCell.type === 'water')
      return chip;
    return Object.assign({}, chip, { cell: this.getHome(chip), level: undefined } );
  }

  // найти id домашней клетки для данного chip
  getHome(chip) {
    const filter = t => c => c.type === t && (t!=='ship' || c.owner === chip.owner);
    if (chip.type ==='chip'  ) return _.find(this.chips, filter('ship')).cell;
    if (chip.type ==='friday') return _.find(this.desk, filter('friday')).id;
    return _.find(this.desk, filter('donkey')).id;
  }

  // сделать chip видимым (ишак или пятница)
  openChip(chip, id) {
    if (this.toCell.opened || chip.cell !== this.to || chip.opened === true )
      return chip;
    return Object.assign(chip, {opened: true, owner: this.player})
  }

  // тотопить монеты
  wreck(chip, id) {
    if ( !this.toCell.safe_for_coin && chip.type === 'coin' && _.includes(this.chipIds, id) )
      return Object.assign({}, chip, {sinked: true});
    return chip;
  }

  // перенести объекты
  move(chip, id) {
    if ( !_.includes(this.chipIds, id) ) return chip;
    const level = this.level || (this.toCell.type === 'marsh' ? 1 : null);
    return Object.assign({}, chip, {cell: this.to, level});
  }

  newChipMethods(){
    return ['knockOut', 'openChip', 'wreck', 'move']
  }

  newChips() {
    return _.map(this.chips, (chip, id) => {
      return this.newChipMethods().reduce((c, m)=> this[m](c, id), _.cloneDeep(chip));
    })
  }

  // активация пиратского корабля или осьминога (block)
  // могут быть две причины:
  // 1. Все фишки (chips) его покинули
  // 2. Игрок вышибает другого
  activateBlock(cell, id, myChipsHere) {
    if (cell.type !== 'block' || cell.active === true) return cell;
    const cond1 = (id === this.chips[this.chipIds[0]].cell && myChipsHere.length === this.chipIds.length);
    const filter = chip=>chip.cell===id && chip.type !== 'coin' && chip.owner !== this.player;
    if (cond1 || (this.to === id && _.find(this.chips, filter)))
      return Object.assign({}, cell, {active: true});
    return cell;
  }

  // открыть клетку
  open(cell, id) {
    if (id !== this.to || cell.opened) return cell;
    return Object.assign({}, cell, {opened: true, owner: this.player})
  }

  // спасение заблокированной фишки (chip) путём прихода подмоги, но не вышибания
  deactivateBlock(cell, id, myChipsHere) {
    if (id !== this.to || cell.type !== 'block' || (myChipsHere.length + 1) < cell.level)
      return cell;
    return Object.assign({}, cell, {active: false});
  }

  newCellMethods() {
    return ['activateBlock', 'open', 'deactivateBlock'];
  }

  newCell(cell, id) {
    const filter = chip => chip.cell === id && chip.owner == this.player;
    const myChipsHere = _.filter(this.chips, filter);
    return this.newCellMethods().reduce((c, m) => this[m](c, id, myChipsHere), _.cloneDeep(cell));
  }

  newDesk() {
    return _.map(this.desk, this.newCell.bind(this));
  }

  nextPlayer() {
    return (this.player + 1)%4;
  }

  newResults() {
    if (this.toCell.type === 'water' && this.chips[this.player * 4].cell === this.to) {
      return Object.assign({}, this.results, {[this.player]: this.results[this.player]+1});
    }
    return this.results;
  }


  newState() {
    const ret = {
      chips: this.newChips(),
      desk: this.newDesk(),
      player: this.player,
      results: this.newResults(),
    };
    if (this.toCell.type === 'hedgehog') {
      const chip = this.chips[_.find(this.chipIds, id=>this.chips[id].type !== 'coin')];
      return new Game(ret, {chipIds: this.chipIds, to: this.getHome(chip)}).newState();
    }
    if (this.toCell.type === 'horse') {
      return ret;
    }
    if (this.toCell.type === 'vortex') {
      const to = 2 * this.to - this.chips[this.chipIds[0]].cell;
      return new Game(ret, {chipIds: this.chipIds, to}).newState();
    }
    if (this.toCell.type !== 'arrow')
      return Object.assign({}, ret, {player: this.nextPlayer(), chips: _.map(ret.chips, chip => {
        return Object.assign({}, chip, {selected: false});
      })});
    if (this.toCell.level !== 1) return ret;
    const argTo = new Arrow(this.toCell).mustMoveTo();
    return new Game(ret, {chipIds: this.chipIds, to: argTo}).newState();
  }

}

export default class Star {
  constructor({direction, id}){
    this.direction = direction;
    this.id = id;

  }

  mustMoveTo() {
    const r = this.id % 13;
    const rs = [r, this.id - r + 12, r+13*12, this.id - r ];
    return rs[this.direction];
  }

}

export default class Arrow {
  constructor(opts){
    ['id', 'level', 'direction'].forEach(k=>this[k]=opts[k]);
    if (!this.direction) this.direction = 0;
    this.neighbors = [-13, -12, 1, 14, 13, 12, -1, -14].map(a=>this.id + a);
  }

  canMoveTo(){
    return this.neighbors.filter((n, i)=> (i - this.direction) % (8/this.level) === 0);
  }

  mustMoveTo() {
    if (this.level !== 1) return false;
    return this.canMoveTo()[0];
  }
}

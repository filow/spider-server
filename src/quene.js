class Quene {
  constructor() {
    this.quene = [];
    this.existed = new Set();
  }

  push(from, to, depth) {
    if (!this.existed.has(to)) {
      this.quene.push({from: from, to: to, depth: depth});
      this.existed.add(to);
      //console.log({from: from, to: to, depth: depth});
    }


    //console.log(this.quene)
    //this.hashs[to]
  }

  get() {
    return this.quene.splice(0, 1)[0]
  }


}
export default Quene;

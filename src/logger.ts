import * as clc from 'cli-color'

export enum Level {success, info, warning, error}

let color = []
color[Level.success] = clc.green;
color[Level.info] = clc.blue;
color[Level.warning] = clc.yellow;
color[Level.error] = clc.red.bold;

export default class Logger {
  constructor(private level = Level.info) {
    
  }
  info(key:string, ...props):void {
    this.log(Level.info, key, props)
  }
  success(key:string, ...props):void {
    this.log(Level.success, key, props)
  }
  warning(key:string, ...props):void {
    this.log(Level.warning, key, props)
  }
  error(key:string, ...props):void {
    this.log(Level.error, key, props)
  }
  private log(type:Level, key:string, props:string[]) {
    if (type >= this.level) {
      let arr = [ color[Level.info](`[${this.GetDateT()}]`), 
                color[type](`[${key.toUpperCase()}]`) ].concat(props)
      console.log.apply(console, arr)
    }
  }
  private GetDateT(){
    let d = new Date();
    return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
  } 

}
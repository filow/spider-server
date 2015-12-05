import clc from 'cli-color'
let color = {
  error: clc.red.bold,
  warn: clc.yellow,
  info: clc.blue,
  success: clc.green
}
function log(type, key, props) {
  let arr = [color[type](`[${key.toUpperCase()}]`)].concat(props)
  console.log.apply(console, arr)
}
export default {
  
  info(key, ...props) {
    log('info', key, props)
  },
  success(key, ...props) {
    log('success', key, props)
  },
  warning(key, ...props) {
    log('warning', key, props)
  },
  error(key, ...props) {
    log('error', key, props)
  }
  
}
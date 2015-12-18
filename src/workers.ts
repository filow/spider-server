import * as _ from 'lodash'
import quene from './quene'

let workers = {}
let workerNumberLimit = 100
// 过期时间2分钟
let workerExpire = 1000*60*3


let workerAliveChecker = function (){
  let now = Date.now()
  let workerToDelete = []
  _.each(workers, (n, key) => {
    let period = now - n.lastActive
    if (period > workerExpire) {
      workerToDelete.push(key)
      console.log(`Worker #${key} ip@${n.id.ip} Expired.`)
    }
  })
  workerToDelete.forEach((n) =>  {
    // 归还元素
    let node = workers[n]
    node.tasks.forEach(task => {
      quene.giveBack(task)
    })
    global['ioInstance'] && global['ioInstance'].emit('delete node', node.id.key)
    // 删除这个节点
    delete workers[n]
    
  })
  setTimeout(workerAliveChecker, 3000)
}
setTimeout(workerAliveChecker, 3000)


export default {
  add(node) {
    if (Object.keys(workers).length >= workerNumberLimit) {
      return false
    } else {
      workers[node.id.key] = node
      return true
    }
  },
  canAdd() {
    return Object.keys(workers).length >= workerNumberLimit
  },
  get(key) {
    return workers[key]
  },
  all() {
    return workers;
  },
  maxAge() {
    return workerExpire;
  },
  isRegisted(node) {
    let key;
    if (typeof node === 'object') {
      key = node.id.key
    } else {
      key = node
    }
    return workers[key]
  }
}

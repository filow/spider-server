import _ from 'lodash'
import {Store} from './store'
export default class Node {
  constructor(ip) {
    this.id = {
      key: parseInt(Math.random()*1000000).toString(16),
      ip: ip,
      time: Number(new Date()),
    }
    this.performance = {
      documents: {
        // 处理的总文档数量
        total: 0,
        // 处理成功的数量
        successed: 0,
        // 处理失败的数量
        failed: 0,
        // 处理的文档总大小
        size: 0
      },
      time: {
        used: 0,

      }


    }
    this.tasks = []
    this.lastActive = new Date()
  }
  getId() {
    return this.id
  }
  setTasks(tasks) {
    this.tasks = tasks
    this.refresh()
  }
  finishTask(task, cb) {
    let index = _.findIndex(this.tasks, (i) => i.loc === task.loc)
    if (index >= 0) {
      this.tasks.splice(index, 1)
      Store.save(task, () => cb && cb())
    } else {
      cb && cb('用户提交的任务不存在')
    }
    
  }
  refresh() {
    this.lastActive = new Date()
  }
}

import * as _ from 'lodash'
import Store from './store'
import quene from './quene'
import Logger from './logger'

let logger = new Logger()
Store.open()

export default class Node {
  public id: ClientNode.Id;
  public os: ClientNode.OsStat;
  public performance: ClientNode.Performance;
  private block:number;
  public lastActive:Date;
  public tasks:TaskItem[];
  
  constructor(ip:string, stats:ClientNode.OsStat) {
    this.id = {
      key: Math.floor(Math.random()*1000000).toString(16),
      ip: ip,
      time: Number(new Date()),
    }
    let {platform, release, arch, node_version} = stats
    this.os = {platform, release, arch, node_version}
    this.performance = {
      documents: {
        // 处理的总文档数量
        total: 0,
        // 处理成功的数量
        success: 0,
        // 处理失败的数量
        failed: 0,
        // 处理的文档总大小
        size: 0,
        single_size: 0
      },
      time: {
        // 爬取所花费的时间
        crawl: 0,
        // 任务在客户端停留的时间
        loop: 0
      },
      memory: {
        free: 0,
        usage: 0,
        total: 0
      },
      loadavg: 0

    }
    this.tasks = []
    this.lastActive = new Date()
    this.block = 0
  }
  getId() {
    return this.id
  }
  setTasks(tasks) {
    this.tasks = tasks
    this.performance.time.crawl = 0
    this.performance.documents.single_size = 0
    this.refresh()
  }
  finishTask(task, cb) {
    if (task.time_used > this.performance.time.crawl){
      this.performance.time.crawl = task.time_used
    }
    this.performance.documents.total += 1
    this.performance.documents.size += task.size
    this.performance.documents.single_size += task.size
    
    global['ioInstance'].emit('data monitor', {time: Date.now(), message: task, node_id: this.id.key})
    
    let index = _.findIndex(this.tasks, (i) => i.loc === task.loc)
    if (index >= 0) {
      this.tasks.splice(index, 1)
      // 如果成功，就把这个结果存起来，否则就退回队列
      if (task.success) {
        this.performance.documents.success += 1
        Store.save(task, () => cb && cb(null, 'ok'))
      } else {
        this.performance.documents.failed += 1
        this.block++
        if (task.errors && task.errors.length >= 5) {
          logger.error('task end', `${task.loc} 连续5次失败，放弃爬取, errors: `, task.errors)
        } else {
          logger.error('task fail', `${task.loc} 失败，放回队列`)
          quene.repush(task)
        }
        cb(null, 'fail')
      }
    } else {
      cb && cb(null, 'no task')
    }
    
  }
  updateStats(stats) {
    this.performance.memory.free = stats.memory.free
    this.performance.memory.usage = stats.memory.usage.heapUsed
    this.performance.memory.total = stats.memory.total
    
    this.performance.loadavg = stats.loadavg[0]
    this.performance.time.loop = stats.total_time
    
  }
  refresh() {
    this.lastActive = new Date()
  }
}

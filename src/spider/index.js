// 三方库以及Nodejs自带库
import _ from 'lodash';
import cheerio from 'cheerio'
import requireDir from 'require-dir' // 将一个目录下所有的文件都require进来

// 功能类库
import Request from './request.js'
import Quene from './quene.js'
import {Store} from './store.js'

let options = {
  maxClient: 20,
  concurrency: 10,
  maxtry: 5,
  port: 6666,
  initUrl: [],
  depth: 5
}
// 分析器和过滤器
let analizers = []

// 程序状态
let isRunning = false
let running_tasks = 0;

// 任务队列
let quene = new Quene();

// 核心抓取函数
function craw(page, cb) {
  let { base_url, from='',depth = 0} =  page;
  Request.get({url: base_url, referer: from}, (err, res) => {
    if (err || !res.ok) {
      let errInfo = {
        code: err.code,
        node: {
          id: 'A01',
          ip: '127.0.0.1',
        },
        message: err.msg,
        time: Number(new Date())
      }
      page.errors.push(errInfo)

      quene.push(page)
      // TODO： 以错误方式加入队列
      console.log(err);

    } else {
      console.log(res.headers['content-type'].match(/^text/))
      if (res.ok) {
        let $ = cheerio.load(res.text)
        // 提取结果对象
        let props = {url: base_url, referer: from, depth}
        // 遍历分析器，把每个分析器返回的结果合并
        analizers.forEach((func) => {
          let result = func(base_url, $)
          _.merge(props, result)
        })
        // console.log(props);

        // console.log(`抓取页面 ${depth}-${props.title}-${base_url}, Content-Length: ${res.headers['content-length'] / 1000}kb`);
        props.links.forEach((i) => {
          quene.push({from: base_url, to: i, depth: depth+1 })
        })
        Store.save(props)
        cb && cb();
      }
    }


  })
}





// 定时运行函数
function run() {
  if (running_tasks < options.concurrency) {
    quene.get((item) => {
      if (item) {
        console.log('找到了页面' + item.to);
        running_tasks += 1;
        craw({base_url: item.to, from: item.from, depth: item.depth}, ()=> running_tasks -= 1);
      } else {
        console.log('...')
      }
    });

  }

  if (isRunning) {
    setTimeout(run.bind(this), 100)
  }
}


let spider = {
  // 设置项
  set(name, value) {
    options[name] = value
    return this;
  },
  // 分析器添加工具
  analizer(instance) {
    analizers.push(instance)
    return this;
  },
  // 启动爬虫
  start() {
    isRunning = true
    quene.get((item) => {
      // 如果当前队列里面还有东西，就取出使用
      if (item) {
        quene.push(item)
      }else {
        options.initUrl.forEach((u) => {
          quene.push({to: u})
        })
      }
      run.call(this)
    })
  },
  // 停止爬虫
  stop() {
    isRunning = false
  },

}

// 分析器, analizer目录下所有的东西都会包含进来
let analizersInDir = requireDir('./analizers', {camelcase: true})
_.each(analizersInDir, (i) => spider.analizer((i)))

export default spider

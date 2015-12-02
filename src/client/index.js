// 三方库以及Nodejs自带库
import _ from 'lodash';
import cheerio from 'cheerio'
import requireDir from 'require-dir' // 将一个目录下所有的文件都require进来
import async from 'async'
// 功能类库
import Request from './request.js'
import Connection from './server_connect'

// 分析器和过滤器
let analizers = []
// 分析器, analizer目录下所有的东西都会包含进来
let analizersInDir = requireDir('./analizers', {camelcase: true})
// 保证common是第一个运行的函数
analizers.push(analizersInDir['common'])
delete analizersInDir['common']
_.each(analizersInDir, i => analizers.push(i))

// 核心抓取函数
function craw(page, cb) {
  if (!page) cb(null, null)
  let { loc, priority} =  page;
  Request.get({url: loc}, (err, res) => {
    if (err || !res.ok) {
      let errInfo = {
        code: err.code,
        message: err.msg,
        time: Number(new Date())
      }
      page.errors.push(errInfo)
      page.success = false
      cb && cb(null, page)
    } else {
      if (res.ok) {
        if(res.headers['content-type'].match(/^text/)) {
          let $ = cheerio.load(res.text)
          // 提取结果对象
          let props = {loc, priority, success: true}
          // 遍历分析器，把每个分析器返回的结果合并
          analizers.forEach((func) => {
            let result = func(loc, $)
            _.merge(props, result)
          })
          props.size = parseInt(res.headers['content-length']);

          cb && cb(null, props);
        } else {
          page.success = true
          // 非文本文件无法处理，直接返回
          cb && cb(null, page);
        }
      }
    }
  })
}



export default class Spider{
  constructor(options) {
    this.task = new Connection(options.server, options.port)
  }
  run() {
    async.forever((next) => {
      this.task.get((err, items) => {
        if (err) {
          console.log('将于5秒后重新尝试连接服务器')
          setTimeout(() => next(null), 5000)
        } else {
          if (items.length <= 0) {
            console.log("服务器目前没有待处理的项目, 将于5秒后重试")
            setTimeout(() => next(null), 5000)
          } else {
            async.map(items, craw, (err, results) => {
              this.submit(results)
              next(1)
            })
          }
        }
        
      });

    }, function (err) {
      console.log('程序发生错误, 退出！', err)
    })

    // run()
  }
  submit(data) {
    this.task.submit(data)
  }
}

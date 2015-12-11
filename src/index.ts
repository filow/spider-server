import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as async from 'async'

import Node from './node'
import workers from './workers'
import quene from './quene'
import Logger from './logger'

let logger = new Logger()
const app = express();
app.use(bodyParser.json())


// 注册一个客户端
app.post('/regist', (req, res) => {
  let response:Response.Regist = {code: 0, msg: 'undefined'}
  if (workers.canAdd()) {
    response.code = 202
    response.msg = 'wait'
  } else {
    let {platform, release, arch, node_version} = req.body
    let node = new Node(req.ip, req.body)
    let id = node.id.key
    response.code = 200
    response.msg = "ok"
    response.id = id
    logger.info("regist", `#${id}, os: ${platform} ${arch} ${release}, node_v: ${node_version}`)
    workers.add(node)
  }

  res.json(response);
});

app.get('/tasks', (req, res) => {
  let id = req.query.id
  if (id) {
    if (workers.isRegisted(id)) {
      // 获取这个节点
      let node = workers.get(id)
      node.refresh()
      let response:Response.GetTask = {code: 200, msg: 'ok', items: []}

      // 如果客户端还有没完成的任务
      if (node.tasks.length > 0){
        response.items = node.tasks
        res.json(response)
      } else {
        // 节点失败几次就制裁几次
        if(node.block > 0) {
          node.block--
          res.json({code: 202, msg: '暂时没有需要处理的任务'});
        }else {
          // 取得任务
          quene.get(20, (err, items) => {
            if (err) {
              res.json({code: 500, msg: '服务器异常'});
            } else if(items.length == 0) {
              res.json({code: 202, msg: '暂时没有需要处理的任务'});
            } else {
              response.items = items
              node.setTasks(items)
              res.json(response)
            }
          })
        }
        
      }


    } else {
      res.json({code: 401, msg: '未注册或已过期的WorkerID'});
    }
  } else {
    res.json({code: 400, msg: '无效请求'});
  }
})

app.post('/tasks', (req, res) => {
  let id = req.query.id
  if (id) {
    if (workers.isRegisted(id)) {
      // 获取这个节点
      let node = workers.get(id)
      let response = {code: 200, msg: 'ok'}
      let {data, stats} = req.body
      async.map(data, node.finishTask.bind(node), function (err, result) {
        logger.info('task', `#${id} [${result.join(', ')}]`)
      })
      node.updateStats(stats)
      
      res.json(response)
    }else {
      res.json({code: 401, msg: '未注册或已过期的WorkerID'});
    }
  } else {
    res.json({code: 400, msg: '无效请求'});
  }
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

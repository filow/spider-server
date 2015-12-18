import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as async from 'async'
import * as path from 'path'

import Node from './node'
import workers from './workers'
import quene from './quene'
import Logger from './logger'

let logger = new Logger()
const app = express();
app.use(bodyParser.json())
app.use(express.static(path.join('../spider-monitor/bower_components')));
app.use(express.static(path.join('../spider-monitor/built')));

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: path.join('../spider-monitor')
  })
})

var http = require('http').Server(app);
var io = require('socket.io')(http);
logger.setIo(io)

global['ioInstance'] = io;

io.on('connection', function(socket){
  socket.emit('clients', workers.all())
  socket.emit('configs', {
    maxAge: workers.maxAge()
  })
  logger.success('Monitor', '网页监视器已连接 id:' + socket.id)
  socket.on('disconnect', function (){
    logger.success('Monitor', '网页监视器已断开连接 id:' + socket.id)
  })
});


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
    io.emit('new node', node)
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
        logger.info('client', `#${id}重新申请任务，获取了${node.tasks.length}个任务`)
        res.json(response)
      } else {
        // 节点失败几次就制裁n/2次
        if(node.block > 0) {
          node.block -= 2
          res.json({code: 202, msg: '暂时没有需要处理的任务'});
        }else {
          node.block = 0
          // 取得任务
          quene.get(5, (err, items) => {
            if (err) {
              res.json({code: 500, msg: '服务器异常'});
            } else if(items.length == 0) {
              res.json({code: 202, msg: '暂时没有需要处理的任务'});
            } else {
              logger.info('client', `已向#${id}分配了${items.length}个任务`)
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
        node.updateStats(stats)
        io.emit('update node', node)
        res.json(response)
      })
      
    }else {
      res.json({code: 401, msg: '未注册或已过期的WorkerID'});
    }
  } else {
    res.json({code: 400, msg: '无效请求'});
  }
})

var server = http.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

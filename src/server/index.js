import express from 'express'
import bodyParser from 'body-parser'
import Node from './node.js'

import workers from './workers'
import quene from './quene'
const app = express();
app.use(bodyParser.json())

// 注册一个客户端
app.get('/regist', (req, res) => {
  let response = {}
  if (workers.canAdd()) {
    response.code = 202
    response.msg = 'wait'

  } else {
    let node = new Node(req.ip)
    let id = node.id.key
    response.code = 200
    response.msg = "ok"
    response.id = id
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
      let response = {code: 200, msg: 'ok'}

      // 如果客户端还有没完成的任务
      if (node.tasks.length > 0){
        response.items = node.tasks
        res.json(response)
      } else {
        // 取得任务
        quene.get(5, (err, items) => {
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
      let {data} = req.body
      
      data.forEach((item) => {
        node.finishTask(item)
      })
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

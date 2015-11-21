import express from 'express'
import Node from './node.js'

import workers from './workers'
import quene from './quene'
const app = express();


// 注册一个客户端
app.get('/regist', (req, res) => {
  let response = {}
  if (workers.canAdd()) {
    response.code = 202
    response.message = 'wait'

  } else {
    let node = new Node(req.ip)
    let id = node.id.key
    response.code = 200
    response.message = "ok"
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
      let response = {code: 200, message: 'ok'}

      // 如果客户端还有没完成的任务
      if (node.tasks.length > 0){
        response.items = node.tasks
        res.json(response)
      } else {
        // 取得任务
        quene.get(5, (err, items) => {
          if (err) {
            res.json({code: 500, message: '服务器异常'});
          } else {
            response.items = items
            node.setTasks(items)
            res.json(response)
          }
        })
      }


    } else {
      res.json({code: 401, message: '未注册或已过期的WorkerID'});
    }
  } else {
    res.json({code: 400, message: '无效请求'});
  }
})

app.post('/tasks', (req, res) => {

})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

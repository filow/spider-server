'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _nodeJs = require('./node.js');

var _nodeJs2 = _interopRequireDefault(_nodeJs);

var _workers = require('./workers');

var _workers2 = _interopRequireDefault(_workers);

var _quene = require('./quene');

var _quene2 = _interopRequireDefault(_quene);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var app = (0, _express2['default'])();
app.use(_bodyParser2['default'].json());

// 注册一个客户端
app.post('/regist', function (req, res) {
  var response = {};
  if (_workers2['default'].canAdd()) {
    response.code = 202;
    response.msg = 'wait';
  } else {
    var _req$body = req.body;
    var platform = _req$body.platform;
    var release = _req$body.release;
    var arch = _req$body.arch;
    var node_version = _req$body.node_version;

    var node = new _nodeJs2['default'](req.ip, req.body);
    var id = node.id.key;
    response.code = 200;
    response.msg = 'ok';
    response.id = id;
    _logger2['default'].info('regist', '#' + id + ', os: ' + platform + ' ' + arch + ' ' + release + ', node_v: ' + node_version);
    _workers2['default'].add(node);
  }

  res.json(response);
});

app.get('/tasks', function (req, res) {
  var id = req.query.id;
  if (id) {
    if (_workers2['default'].isRegisted(id)) {
      (function () {
        // 获取这个节点
        var node = _workers2['default'].get(id);
        node.refresh();
        var response = { code: 200, msg: 'ok' };

        // 如果客户端还有没完成的任务
        if (node.tasks.length > 0) {
          response.items = node.tasks;
          res.json(response);
        } else {
          // 节点失败几次就制裁几次
          if (node.block > 0) {
            node.block--;
            res.json({ code: 202, msg: '暂时没有需要处理的任务' });
          } else {
            // 取得任务
            _quene2['default'].get(5, function (err, items) {
              if (err) {
                res.json({ code: 500, msg: '服务器异常' });
              } else if (items.length == 0) {
                res.json({ code: 202, msg: '暂时没有需要处理的任务' });
              } else {
                response.items = items;
                node.setTasks(items);
                res.json(response);
              }
            });
          }
        }
      })();
    } else {
      res.json({ code: 401, msg: '未注册或已过期的WorkerID' });
    }
  } else {
    res.json({ code: 400, msg: '无效请求' });
  }
});

app.post('/tasks', function (req, res) {
  var id = req.query.id;
  if (id) {
    if (_workers2['default'].isRegisted(id)) {
      // 获取这个节点
      var node = _workers2['default'].get(id);
      var response = { code: 200, msg: 'ok' };
      var _req$body2 = req.body;
      var data = _req$body2.data;
      var stats = _req$body2.stats;

      _async2['default'].map(data, node.finishTask.bind(node), function (err, result) {
        _logger2['default'].info('task', '#' + id + ' [' + result.join(', ') + ']');
      });
      node.updateStats(stats);

      res.json(response);
    } else {
      res.json({ code: 401, msg: '未注册或已过期的WorkerID' });
    }
  } else {
    res.json({ code: 400, msg: '无效请求' });
  }
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
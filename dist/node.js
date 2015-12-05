'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _store = require('./store');

var _quene = require('./quene');

var _quene2 = _interopRequireDefault(_quene);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

_store.Store.open();

var Node = (function () {
  function Node(ip, stats) {
    _classCallCheck(this, Node);

    this.id = {
      key: parseInt(Math.random() * 1000000).toString(16),
      ip: ip,
      time: Number(new Date())
    };
    var platform = stats.platform;
    var release = stats.release;
    var arch = stats.arch;
    var node_version = stats.node_version;

    this.os = { platform: platform, release: release, arch: arch, node_version: node_version };
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

    };
    this.tasks = [];
    this.lastActive = new Date();
    this.block = 0;
  }

  _createClass(Node, [{
    key: 'getId',
    value: function getId() {
      return this.id;
    }
  }, {
    key: 'setTasks',
    value: function setTasks(tasks) {
      this.tasks = tasks;
      this.refresh();
    }
  }, {
    key: 'finishTask',
    value: function finishTask(task, cb) {
      this.performance.time.crawl += task.time_used;
      this.performance.documents.total += 1;
      this.performance.documents.size += task.size;

      var index = _lodash2['default'].findIndex(this.tasks, function (i) {
        return i.loc === task.loc;
      });
      if (index >= 0) {
        this.tasks.splice(index, 1);
        // 如果成功，就把这个结果存起来，否则就退回队列
        if (task.success) {
          this.performance.documents.success += 1;
          _store.Store.save(task, function () {
            return cb && cb(null, 'ok');
          });
        } else {
          this.performance.documents.failed += 1;
          this.block++;
          if (task.errors && task.errors.length >= 5) {
            _logger2['default'].error('task end', '' + task.loc + ' 连续5次失败，放弃爬取, errors: ', task.errors);
          } else {
            _logger2['default'].error('task fail', '' + task.loc + ' 失败，放回队列');
            _quene2['default'].repush(task);
          }
          cb(null, 'fail');
        }
      } else {
        cb && cb(null, 'no task');
      }
    }
  }, {
    key: 'updateStats',
    value: function updateStats(stats) {
      this.performance.memory.free = stats.memory.free;
      this.performance.memory.usage = stats.memory.usage.heapUsed;
      this.performance.memory.total = stats.memory.total;

      this.performance.loadavg = stats.loadavg[0];
      this.performance.time.loop += stats.total_time;
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this.lastActive = new Date();
    }
  }]);

  return Node;
})();

exports['default'] = Node;
module.exports = exports['default'];
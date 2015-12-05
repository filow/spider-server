'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _quene = require('./quene');

var _quene2 = _interopRequireDefault(_quene);

var workers = {};
var workerNumberLimit = 5;
// 过期时间2分钟
var workerExpire = 1000 * 60 * 2;

var workerAliveChecker = function workerAliveChecker() {
  var now = new Date();
  var workerToDelete = [];
  _lodash2['default'].each(workers, function (n, key) {
    var period = now - n.lastActive;
    if (period > workerExpire) {
      workerToDelete.push(key);
      console.log('Worker #' + key + ' ip@' + n.id.ip + ' Expired.');
    }
  });
  workerToDelete.forEach(function (n) {
    // 归还元素
    var node = workers[n];
    node.tasks.forEach(function (task) {
      _quene2['default'].giveBack(task);
    });
    // 删除这个节点
    delete workers[n];
  });
  setTimeout(workerAliveChecker, 3000);
};
setTimeout(workerAliveChecker, 3000);

exports['default'] = {
  add: function add(node) {
    if (Object.keys(workers).length >= workerNumberLimit) {
      return false;
    } else {
      workers[node.id.key] = node;
      return true;
    }
  },
  canAdd: function canAdd() {
    return Object.keys(workers).length >= workerNumberLimit;
  },
  get: function get(key) {
    return workers[key];
  },
  isRegisted: function isRegisted(node) {
    var key = undefined;
    if (typeof node === 'object') {
      key = node.id.key;
    } else {
      key = node;
    }
    return workers[key];
  }
};
module.exports = exports['default'];
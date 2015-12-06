'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _bloomRedis = require('bloom-redis');

var _bloomRedis2 = _interopRequireDefault(_bloomRedis);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var client = _redis2['default'].createClient();
var queneKey = 'SpiderQuene';
var siteMapDir = './tmp/sitemap';
// bloom Filter
_bloomRedis2['default'].connect(client);
var filter = new _bloomRedis2['default'].BloomFilter({ key: 'SpiderVisited' });

// 建立备用的队列描述文件
var siteMapFiles = [];
var files = _fs2['default'].readdirSync(siteMapDir);
files.forEach(function (f) {
  if (/\.xml\.gz$/.test(f)) {
    siteMapFiles.push(f);
  }
});

client.on('error', function (err) {
  _logger2['default'].error('redis', err.toString());
});

function getOne(key, cb) {
  client.lpop(key, function (err, value) {
    if (err) {
      cb(err);
    } else {
      if (!value) {
        cb(null);
      } else {
        cb(null, JSON.parse(value));
      }
    }
  });
}

// 正向正则，满足条件才会通过
var regex = [/cn.engadget.com(\/\d+){3}/];

function isValidUrl(url) {
  for (var i = 0; i < regex.length; i++) {
    if (regex[i].test(url)) {
      return true;
    }
  }
  return false;
}

var quene = {
  repush: function repush(props) {
    var itemString = JSON.stringify(props);
    client.rpush(queneKey, itemString);
  },
  push: function push(props) {
    var _props$priority = props.priority;
    var priority = _props$priority === undefined ? '' : _props$priority;
    var loc = props.loc;
    var _props$errors = props.errors;
    var errors = _props$errors === undefined ? [] : _props$errors;

    // 判断元素是否存在

    filter.contains(loc, function (err, isContain) {
      if (!isContain) {
        var itemString = JSON.stringify({ priority: priority, loc: loc, errors: errors });
        client.rpush(queneKey, itemString);

        filter.add(loc);
      }
    });
  },

  get: function get(n, cb) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push(queneKey);
    }
    _async2['default'].map(arr, getOne, function (err, results) {

      cb(err, _lodash2['default'].filter(results, function (n) {
        return !!n;
      }));
    });
  },
  giveBack: function giveBack(item) {
    var itemString = JSON.stringify(item);
    client.lpush(queneKey, itemString);
  },
  end: function end() {
    client.end();
  }

};

// 定时检测队列的长度，如果队列长度不够1000，那么就读取sitemap文件，并将结果推入队列
function checkAndFillQuene() {
  client.llen(queneKey, function (err, value) {
    var count = Number(value);
    if (count < 1000) {
      (function () {
        var counter = 0;
        var mapFile = siteMapFiles.pop();
        if (mapFile) {
          (function () {
            var filePath = _path2['default'].resolve(siteMapDir, mapFile);
            console.log('开始从' + mapFile + '中获取url');

            _fs2['default'].readFile(filePath, function (err, gzContent) {
              _zlib2['default'].gunzip(gzContent, function (err, plainContent) {
                console.log('已解压文件，正在处理...');
                try {
                  (function () {
                    var $ = _cheerio2['default'].load(plainContent);
                    console.log('文件解析完毕，开始判断链接...');
                    $('loc').each(function (i, e) {
                      var $e = $(e);
                      var loc = $e.text();
                      var priority = parseFloat($(e).siblings('priority').text());
                      if (isValidUrl(loc)) {
                        counter++;
                        quene.push({ loc: loc, priority: priority });
                      }
                    });
                  })();
                } catch (e) {
                  console.log('加载文件出现错误, filename: ' + filePath);
                }

                console.log('共添加了' + counter + '个记录');

                _fs2['default'].unlinkSync(filePath);
                if (counter < 100) {
                  setTimeout(checkAndFillQuene, 1000);
                } else {
                  setTimeout(checkAndFillQuene, 5000);
                }
              });
            });
          })();
        }
      })();
    } else {
      setTimeout(checkAndFillQuene, 5000);
    }
  });
}
setTimeout(checkAndFillQuene, 0);

exports['default'] = quene;
module.exports = exports['default'];
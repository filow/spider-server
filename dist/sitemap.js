'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _xml2json = require('xml2json');

var _xml2json2 = _interopRequireDefault(_xml2json);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var sitemap_url = 'http://cn.engadget.com/sitemap_index.xml';

var sitemapIndexes = [];
var header = {
  'Host': 'cn.engadget.com',
  'User-Agent': 'BaiduSpider'
};

getSiteMapIndex(sitemap_url, function (err, url_list) {
  if (err) {
    throw new Error(err);
  }

  _async2['default'].eachLimit(url_list, 5, function (i, callback) {
    getSiteMap(i.loc, function () {
      return callback();
    });
  }, function (err) {
    if (err) {
      // One of the iterations produced an error.
      // All processing will now stop.
      console.log(err);
    } else {
      console.log('All files have been processed successfully');
    }
  });
});

function getSiteMapIndex(url, cb) {
  var options = {
    url: url,
    headers: header
  };
  (0, _request2['default'])(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = _xml2json2['default'].toJson(body);
      var obj = JSON.parse(json);
      console.log('[GET] ' + url + ' 200');
      cb(null, obj.sitemapindex.sitemap);
    } else {
      cb(error);
    }
  });
}
// 可利用缓存的sitemap获取函数
function getSiteMap(url, cb) {
  var base_dir = './tmp/sitemap';
  var filename = url.split('/')[3];
  var abs_path = _path2['default'].resolve(base_dir, filename);
  if (!_fs2['default'].existsSync(abs_path)) {
    var options = { url: url, headers: header };
    var output = _fs2['default'].createWriteStream(abs_path);
    (0, _request2['default'])(options).pipe(output);
    output.on('finish', function () {
      console.error('[GET] ' + url + ' 200');
      cb(null);
    });
  } else {
    cb(null);
    console.log('' + abs_path + '已存在');
  }
}
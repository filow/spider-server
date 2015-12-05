'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _mongodb = require('mongodb');

var url = 'mongodb://localhost:27017/Spider';

var collection = {
  page: 'page',
  error: 'error_page'
};

var dbInstance = undefined;
// 获取数据库实例
function getDbInstance(cb) {
  if (dbInstance) {
    cb(dbInstance);
  } else {
    _mongodb.MongoClient.connect(url, function (err, db) {
      if (err) throw err;

      console.log('已连接数据库服务器, Host: localhost, port: 27017, Database: Spider');
      dbInstance = db;
      cb && cb(db);
    });
  }
}

var Store = (function () {
  function Store() {
    _classCallCheck(this, Store);
  }

  _createClass(Store, null, [{
    key: 'open',
    value: function open() {
      getDbInstance();
    }
  }, {
    key: 'save',
    value: function save(item, cb) {
      getDbInstance(function (db) {
        db.collection(collection.page).insertOne(item, function (err, r) {
          if (err) console.log('数据插入错误： ' + err);
          cb && cb(r);
        });
      });
    }
  }, {
    key: 'save_many',
    value: function save_many(items) {
      getDbInstance(function (db) {
        db.collection(collection.page).insertMany(items, function (err, r) {
          if (err) console.log('数据插入错误： ' + err);
          cb && cb(r);
        });
      });
    }
  }, {
    key: 'save_error',
    value: function save_error(item) {
      getDbInstance(function (db) {
        db.collection(collection.error).insertMany(item, function (err, r) {
          if (err) console.log('数据插入错误： ' + err);
          cb && cb(r);
        });
      });
    }
  }, {
    key: 'save_log',
    value: function save_log() {}
  }, {
    key: 'close',
    value: function close() {
      db.close();
    }
  }]);

  return Store;
})();

exports['default'] = { Store: Store };
module.exports = exports['default'];
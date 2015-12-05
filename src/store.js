import {MongoClient} from 'mongodb'
let url = 'mongodb://localhost:27017/Spider';


let collection = {
  page: 'page',
  error: 'error_page'
}


let dbInstance;
// 获取数据库实例
function getDbInstance(cb) {
  if (dbInstance) {
    cb(dbInstance);
  } else {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;

      console.log(`已连接数据库服务器, Host: localhost, port: 27017, Database: Spider`);
      dbInstance = db;
      cb && cb(db);
    });
  }
}


class Store {
  static open() {
    getDbInstance()
  }
  static save(item, cb) {
    getDbInstance((db) => {
      db.collection(collection.page).insertOne(item, function(err, r) {
        if(err) console.log(`数据插入错误： ${err}`)
        cb && cb(r);
      });
    })
  }
  static save_many(items) {
    getDbInstance((db) => {
      db.collection(collection.page).insertMany(items, function(err, r) {
        if(err) console.log(`数据插入错误： ${err}`)
        cb && cb(r);
      });
    })
  }
  static save_error(item) {
    getDbInstance((db) => {
      db.collection(collection.error).insertMany(item, function(err, r) {
        if(err) console.log(`数据插入错误： ${err}`)
        cb && cb(r);
      });
    })
  }
  static save_log() {

  }
  static close() {
    db.close();
  }

}
export default {Store}

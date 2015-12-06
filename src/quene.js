import redis from "redis"
import bloom from 'bloom-redis'
import async from 'async'
import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import cheerio from 'cheerio'

import logger from './logger'

let client = redis.createClient();
let queneKey = "SpiderQuene"
let siteMapDir = './tmp/sitemap'
// bloom Filter
bloom.connect(client);
let filter = new bloom.BloomFilter({ key : 'SpiderVisited' });

// 建立备用的队列描述文件
let siteMapFiles = []
let files = fs.readdirSync(siteMapDir)
files.forEach((f) => {
  if (/\.xml\.gz$/.test(f)) {
    siteMapFiles.push(f)
  }
})


client.on("error", function (err) {
  logger.error('redis', err.toString())
});

function getOne(key, cb) {
  client.lpop(key, function (err, value){
    if (err) {
      cb(err)
    } else {
      if(!value) {
        cb(null)
      }else {
        cb(null, JSON.parse(value))
      }
    }
  });
}

// 正向正则，满足条件才会通过
let regex = [
  /cn.engadget.com(\/\d+){3}/,
]

function isValidUrl(url){
  for (var i = 0; i < regex.length; i++) {
    if(regex[i].test(url)){
      return true;
    }
  }
  return false
}



let quene = {
  repush(props) {
    let itemString = JSON.stringify(props)
    client.rpush(queneKey, itemString)
  },
  push(props) {
    let { priority='', loc, errors=[] } = props
    // 判断元素是否存在

    filter.contains(loc, (err, isContain)=> {
      if(!isContain) {
        let itemString = JSON.stringify({priority, loc, errors})
        client.rpush(queneKey, itemString)

        filter.add(loc);
      }
    });
  },

  get(n, cb){
    let arr = []
    for (let i = 0; i < n; i++) {  arr.push(queneKey) }
    async.map(arr, getOne, (err, results) => {
      
      cb(err, _.filter(results, (n) => !!n) )
    });
  },
  giveBack(item) {
    let itemString = JSON.stringify(item)
    client.lpush(queneKey, itemString)
  },
  end() {
    client.end();
  }

}

// 定时检测队列的长度，如果队列长度不够1000，那么就读取sitemap文件，并将结果推入队列
function checkAndFillQuene() {
  client.llen(queneKey, (err, value) => {
    let count = Number(value)
    if (count < 1000) {
      let counter = 0
      let mapFile = siteMapFiles.pop()
      let filePath = path.resolve(siteMapDir, mapFile)
      console.log(`开始从${mapFile}中获取url`)
      
      fs.readFile(filePath, (err, gzContent) => {
        zlib.gunzip(gzContent, function (err, plainContent) {
          console.log(`已解压文件，正在处理...`)
          try {
            let $ = cheerio.load(plainContent)
            console.log(`文件解析完毕，开始判断链接...`)
            $('loc').each(function (i, e) {
              let $e = $(e)
              let loc = $e.text()
              let priority = parseFloat($(e).siblings('priority').text())
              if (isValidUrl(loc)) {
                counter++
                quene.push({loc, priority})
              }
            })
          }catch(e) {
            console.log('加载文件出现错误, filename: ' + filePath)
          }
          
          
          console.log(`共添加了${counter}个记录`)
          
          fs.unlinkSync(filePath)
          if (counter < 100) {
            setTimeout(checkAndFillQuene, 1000)
          }else {
            setTimeout(checkAndFillQuene, 5000)
          }
        })
      })
    } else {
      setTimeout(checkAndFillQuene, 5000)
    }
    
  })
}
setTimeout(checkAndFillQuene, 0)

export default quene;

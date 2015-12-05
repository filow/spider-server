import request from 'request'
import agent from 'superagent'
import xml2json from 'xml2json'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import async from 'async'
let sitemap_url = 'http://www.douban.com/sitemap_index.xml'

let sitemapIndexes = []
let header = {
  'Host': 'www.douban.com',
  'User-Agent': 'BaiduSpider'
}

getSiteMapIndex(sitemap_url, function (err, url_list) {
  if (err) { throw new Error(err)}
  
  async.eachLimit(url_list, 5, function (i, callback){
    getSiteMap(i.loc, () => callback())
     
  }, function (err) {
    if( err ) {
      // One of the iterations produced an error.
      // All processing will now stop.
      console.log(err);
    } else {
      console.log('All files have been processed successfully');
    }
  })
  
  
})


function getSiteMapIndex(url, cb) {
  let options = {
    url: url,
    headers: header
  }
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let json = xml2json.toJson(body)
      let obj = JSON.parse(json)
      console.log(`[GET] ${url} 200`)
      cb(null, obj.sitemapindex.sitemap)
    }else {
      cb(error)
    }
  })
}
// 可利用缓存的sitemap获取函数
function getSiteMap(url, cb) {
  let base_dir = './tmp/sitemap'
  let filename = url.split('/')[3]
  let abs_path = path.resolve(base_dir, filename)
  if(!fs.existsSync(abs_path)) {
    let options = { url: url, headers: header }
    let output = fs.createWriteStream(abs_path);
    request(options).pipe(output)
    output.on('finish', function() {
      console.error(`[GET] ${url} 200`); 
      cb(null)
    });

  }else {
    cb(null)
    console.log(`${abs_path}已存在`)
  }

  
}
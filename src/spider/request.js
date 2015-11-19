import request from 'superagent';
import Agent from 'agentkeepalive'
let apiUrl = {
  book: 'http://api.douban.com/v2/book/{id}',
  movie: 'http://api.douban.com/v2/movie/subject/{id}'
}

let header = {
  encoding: 'gzip, deflate',
  ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
}

let keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 20000,
  keepAliveTimeout: 10000 // free socket keepalive for 30 seconds
});


let onerrorHandler = []
function triggerError(err, message){
  onerrorHandler.forEach((func) => func(err.status, message))
}


class Request {
  static get(options, callback) {
    let {url, referer=''} = options;
    request.get(url)
      .set('Accept-Encoding', header.encoding)
      .set('User-Agent', header.ua)
      .set('Referer', referer)
      .set('Connection', 'keep-alive')
      .agent(keepaliveAgent)
      .end((err, res) => {
        // 如果发生了错误
        if (err) {
          if (err.status) {
            // 4xx或者5xx问题
            let type = err.status / 100 | 0
            if (type == 4) {
              triggerError(err, "请求失败")
            } else if (type == 5) {
              triggerError(err, "服务器错误")
            } else {
              triggerError(err, "未知错误")
            }
          } else {
            // 网络问题，超时以及其他错误
            triggerError(err, "网络错误")
          }
        } else {
          callback(res)
        }
      });
  }
  static onerror(func){
    onerrorHandler.push(func)
  }

}

export default Request

import request from 'superagent';
import Agent from 'agentkeepalive'

let ua = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36",
  "BaiduSpider",
  "Slurp",
  "Sosospider",
  "GoogleSpider"
]

function getUa() {
  return ua[Math.floor( Math.random()*ua.length )]
}

let keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 20000,
  keepAliveTimeout: 10000 // free socket keepalive for 30 seconds
});


class Request {
  static get(options, callback) {
    let {url, referer=''} = options;
    request.get(url)
      .set('Accept-Encoding', 'gzip, deflate')
      .set('User-Agent', getUa())
      .set('Referer', referer)
      .redirects(0)
      .set('Connection', 'keep-alive')
      .agent(keepaliveAgent)
      .end((err, res) => {
        // 如果发生了错误
        if (err) {
          if (err.status) {
            // 4xx或者5xx问题
            let type = err.status / 100 | 0
            let errMsg
            if (type == 4) {
              errMsg = "请求失败"
            } else if (type == 5) {
              errMsg = "服务器错误"
            } else if (type == 3) {
              errMsg = "跳转"
            } else {
              errMsg = "未知错误"
            }
            callback({code: err.status, msg: errMsg})
          } else {
            // 网络问题，超时以及其他错误
            callback({code: err.code, msg: '网络超时或故障'})
          }
        } else {
          callback(null, res)
        }
      });
  }


}

export default Request

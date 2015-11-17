import request from 'superagent';
import cheerio from 'cheerio';
import Agent from 'agentkeepalive';
import url from 'url';
import Quene from './quene.js';

let keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 20000,
  keepAliveTimeout: 10000 // free socket keepalive for 30 seconds
});

var util = {
  isValid(url) {
    return /^http:\/\/[\w\.]*douban\.com/.test(url);
  }

};


var quene = new Quene();

function request_douban_book(id) {
  request.get('http://api.douban.com/v2/book/' + id)
    .set('Accept-Encoding', 'gzip, deflate')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36')
    .agent(keepaliveAgent)
    .end((err, res) => {
      if (err) {
        // 错误处理逻辑
      }

      if (res.ok) {
        //console.log(res.headers['content-length']);
      }

    });
}

function request_douban_movie(id) {

}

function save_book(data) {

}

function save_movie(data) {

}

function crap(page, cb) {
  console.log('Calling', page);
  let { base_url, from='',depth = 0} =  page;

  let douban_book_regex = /book\.douban\.com\/subject\/(\d+)/;
  let douban_movie_regex = /movie\.douban\.com\/subject\/(\d+)/;
  if (douban_book_regex.test(base_url)) {
    // 如果是豆瓣图书页面,就去请求这个页面,并保存结果
    let id = base_url.match(douban_book_regex)[1];
    let result = request_douban_book(id);
    save_book(result);
  } else if (douban_movie_regex.test(base_url)) {
    // 如果是豆瓣电影页面
    let id = base_url.match(douban_movie_regex)[1];
    let result = request_douban_movie(id);
    save_movie(result);
  }

  request.get(base_url)
    .set('Accept-Encoding', 'gzip, deflate')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36')
    .set('Referer', from)
    .agent(keepaliveAgent)
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        if (res.ok) {
          let $ = cheerio.load(res.text);
          let props = {};
          props.title = $('title').text();
          props.description = $('meta[name=description]').attr('content');
          console.log(`抓取页面 ${depth}-${props.title}-${base_url}, Content-Length: ${res.headers['content-length'] / 1000}kb`);
          $('a').each(function (i, elem) {
            let href = $(this).attr('href');
            if (href) {
              let abs_url = url.resolve(base_url, href);
              if (util.isValid(abs_url)) {
                //abs_url = abs_url.substring(0, abs_url.indexOf('#'));
                //console.log('abs_url: ',abs_url)
                quene.push(base_url, abs_url, depth + 1);
              }
            }

          });

          cb && cb();
        } else {
          console.error(`页面 ${depth}-${props.title}-${base_url}抓取失败`)
        }
      }

    });


}
quene.push('', 'http://www.douban.com/', 0);

let running_tasks = 0;
function checkList() {
  if (running_tasks < 5) {
    let item = quene.get();
    if (item) {
      console.log('找到了页面' + item.to);
      running_tasks += 1;
      crap({base_url: item.to, from: item.from, depth: item.depth}, ()=> running_tasks -= 1);
    } else {
      console.log('...')
    }
  }

  setTimeout(checkList, 200);
}
setTimeout(checkList, 0);

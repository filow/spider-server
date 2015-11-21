import nurl from 'url'
import rule from '../../'
// 正向正则，满足条件才会通过
let regex_positive = [
  /^http:\/\/[\w\.]*hhu\.edu\.cn/
]
// 反向正则，不满足条件才能通过
let regex_negative = [
  /my\.hhu\.edu.cn/,
]

// 构建白名单
let _ext_whiteList = ["htm", "html", "jspy", "asp", "jsp", "aspx"]
let ext_whiteList = {};
for (var i = 0; i < _ext_whiteList.length; i++) {
  ext_whiteList[_ext_whiteList[i]] = true;
}


function isValidUrl(url){
  for (var i = 0; i < regex_positive.length; i++) {
    if(!regex_positive[i].test(url)){
      return false;
    }
  }
  for (var i = 0; i < regex_negative.length; i++) {
    if(regex_negative[i].test(url)){
      return false;
    }
  }
  // 下面验证拓展名
  // 抽取拓展名并试图排除非html文档，以节省流量
  let ext_arr = url.match(/\.(\w+)$/)
  // 如果ext_arr不为空（有拓展名），则判断拓展名是否为htm或html，否则就直接通过
  let inList = ext_arr === null || ext_arr && ext_whiteList[ext_arr[1]];
  if (!inList) {
    console.log(`${url} 不是一个合法的html url地址，放弃追踪`)
    return false;
  }

  return true;
}

export default function (url, $){
  let result = {title: '', keywords: [], links: []}

  result.title = $('title').text().trim();
  // keywords
  let keywords = $('meta[name=keywords]').attr('content');
  if (keywords) {
    keywords = keywords.trim().split(',').map((s) => s.trim())
    result.keywords = keywords
  }
  // description
  result.description = $('meta[name=description]').attr('content');

  // links
  // nofollow链接不允许点击
  $('a[rel!=nofollow]').each(function (i, elem){
    // 提取链接
    let href = $(this).attr('href');
    if (href) {
      let abs_url = nurl.resolve(url, href);
      if (isValidUrl(abs_url)) {
        result.links.push(abs_url)
      }
    }
  });

  return result;
}

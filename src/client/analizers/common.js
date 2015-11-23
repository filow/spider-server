import {spaceTrim} from '../util.js';
import nurl from 'url'
// 正向正则，满足条件才会通过
let regex_positive = [
  /^http:\/\/[\w\.]*hhu\.edu\.cn/
]
// 反向正则，不满足条件才能通过
let regex_negative = [
  /my\.hhu\.edu.cn/,
]

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

  $('style, script').remove()
  result.text = spaceTrim($('body').text())

  return result;
}

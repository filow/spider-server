import {spaceTrim} from '../util.js';
import nurl from 'url'



export default function (url, $){
  let result = {title: '', keywords: []}

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
  // $('a[rel!=nofollow]').each(function (i, elem){
  //   // 提取链接
  //   let href = $(this).attr('href');
  //   if (href) {
  //     let abs_url = nurl.resolve(url, href);
  //     if (isValidUrl(abs_url)) {
  //       result.links.push(abs_url)
  //     }
  //   }
  // });

  return result;
}

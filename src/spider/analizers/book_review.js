import {spaceTrim} from '../util.js';

export default function (url, $){
  // 检验该网页是否为本分析器适用
  if (/book\.douban\.com\/review\/(\d+)/.test(url)){
    let description = [];
    description.push( $('#content h1').text() );

    // 图书信息
    // description.push( $('#info').text() );
    // 评论
    description.push(
      $('#link-report').text()
    );
    return {text: description.map((text) => spaceTrim(text)).join(' ')}
  }else{
    return {}
  }

}

import {spaceTrim} from '../util.js';

export default function (url, $){
  // 检验该网页是否为本分析器适用
  if (/movie\.douban\.com\/subject\/(\d+)/.test(url)){
    let description = [];
    // 标题
    description.push( $('#wrapper h1').text() );

    // 基本信息
    description.push( $('#info').text() );
    // 影片简介
    description.push( $('#link-report').text() );
    return {text: description.map((text) => spaceTrim(text)).join(' ')}
  }else{
    return {}
  }

}

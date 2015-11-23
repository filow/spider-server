import {spaceTrim} from '../util.js';

export default function (url, $){
  // 检验该网页是否为本分析器适用
  if (/news\.hhu\.edu\.cn/.test(url)){
    let description = [];
    description.push( $('.biaoti3').text() );
    $('#zoom div').remove()
    description.push( $('#zoom').text() );
    description.push( $('.STYLE2').text() );

    return {text: description.map((text) => spaceTrim(text)).join(' ')}
  }else{
    return {}
  }

}

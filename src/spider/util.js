export function spaceTrim(str){
  if (str) {
    return str.trim().replace(/[ \n\t\r\s]+/g, ' ')
  } else {
    return ""
  }
}

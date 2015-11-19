export function spaceTrim(str){
  if (str) {
    return str.trim().replace(/\s+/g, ' ')
  } else {
    return ""
  }
}

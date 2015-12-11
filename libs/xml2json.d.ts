declare module "xml2json" {
  module m {
    interface Options {
      object?: boolean,
      reversible?: boolean,
      sanitize_values?: boolean
    }
    function toJson(xml: string, options?: Options)
    function toXml(json: string, options?: Options)
  }
  export = m
}
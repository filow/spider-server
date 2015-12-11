declare module "bloom-redis" {
  import * as redis from "redis"
  module m {
    function connect(client: redis.RedisClient):void
    function BloomFilter(options: any):void
  }
  export = m
}
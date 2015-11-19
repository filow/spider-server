import redis from "redis"
let client = redis.createClient();

client.on("error", function (err) {
    console.log("Redis Error " + err);
});

class Quene {
  constructor() {
    this.queneKey = "SpiderQuene";
    this.setKey = "SpiderVisited";
  }

  push(props) {
    let { from='', to, depth=0, errors=[] } = props
    // 判断元素是否存在

    client.sadd(this.setKey, String(to), function (err, isSet){
      // 如果不存在，就加入队列
      if (isSet == 0) {
        let itemString = JSON.stringify({from, to, depth, errors})
        // console.log(itemString)
        client.rpush(this.queneKey, itemString)
        //console.log({from: from, to: to, depth: depth});
      }
    })

    //console.log(this.quene)
    //this.hashs[to]
  }

  get(cb) {
    client.lpop(this.queneKey, function (err, value){
      if (!value){
        cb(null);
      }else{
        cb(JSON.parse(value));
      }
      console.log(value);

    });
  }

  end() {
    client.end();
  }

}
export default Quene;

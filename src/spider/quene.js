import redis from "redis"
import bloom from 'bloom-redis'

let client = redis.createClient();
bloom.connect(client);


client.on("error", function (err) {
    console.log("Redis Error " + err);
});

class Quene {
  constructor() {
    this.queneKey = "SpiderQuene";
    this.filter = new bloom.BloomFilter({ key : 'SpiderVisited' });
  }

  push(props) {
    let { from='', to, depth=0, errors=[] } = props
    // 判断元素是否存在

    this.filter.contains(to, (err, isContain)=> {
      if(!isContain) {
        let itemString = JSON.stringify({from, to, depth, errors})
        client.rpush(this.queneKey, itemString)
        //console.log({from: from, to: to, depth: depth});

        this.filter.add(to);
      }
    });
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

import redis from "redis"
import bloom from 'bloom-redis'
import async from 'async'

let client = redis.createClient();
let queneKey = "SpiderQuene"

// bloom Filter
bloom.connect(client);
let filter = new bloom.BloomFilter({ key : 'SpiderVisited' });



client.on("error", function (err) {
  console.log("Redis Error " + err);
});

function getOne(key, cb) {
  client.lpop(key, function (err, value){
    if (!value){
      cb(null);
    }else{
      cb(err, JSON.parse(value));
    }
  });
}

let quene = {
  push(props) {
    let { from='', to, depth=0, errors=[] } = props
    // 判断元素是否存在

    filter.contains(to, (err, isContain)=> {
      if(!isContain) {
        let itemString = JSON.stringify({from, to, depth, errors})
        client.rpush(queneKey, itemString)
        //console.log({from: from, to: to, depth: depth});

        this.filter.add(to);
      }
    });
  },

  get(n, cb){
    let arr = []
    for (let i = 0; i < n; i++) {  arr.push(queneKey) }
    async.map(arr, getOne, (err, results) => {
      cb(err, results)
    });
  },
  giveBack(item) {
    let itemString = JSON.stringify(item)
    client.lpush(queneKey, itemString)
  },
  end() {
    client.end();
  }

}
export default quene;

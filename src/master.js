// 爬虫主程序文件，包含服务器部分和爬虫部分
import spider from './spider'
spider
  .set('maxClient', 20)
  .set('concurrency', 10)
  .set('maxtry', 5)
  .set('port', 6666)
  .set('initUrl', ['http://www.hhu.edu.cn/'])
  .set('depth', 5)
  .start();

// setTimeout(() => spider.stop(), 1500)

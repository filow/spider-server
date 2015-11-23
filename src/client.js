import Spider from './client/index'

let client = new Spider({
  server: '127.0.0.1',
  port: 3000
})
client.run()
// spider.run()

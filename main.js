const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs').promises
const {createReadStream} = require('fs')
const mime = require('mime')  // 获取文件格式
const ejs = require('ejs')  // 借助模板
const { promisify } = require('util')
const openUrl = require('./openUrl')

// ejs.renderFile()

function mergeConfig(config) {
  return {
    directory: process.cwd(),  // 当前工作目录
    ...config
  }
}
// dfs

class Server{
  constructor(config) {
    this.config = mergeConfig(config)
  }
  start() {
    let server = http.createServer(this.serveHandle.bind(this))
    server.listen(this.config.program._optionValues.port || 1234, () => {
      console.log('服务端开始运行了')
      openUrl(`http://localhost:${this.config.program._optionValues.port || 1234}`)
    })
  }

  async serveHandle(req, res) {
    console.log('有请求启动了。。。')
    // 路径拼接  拼接启动参数里的路径
    const dirurl = this.config.program._optionValues.directory || this.config.directory
    let { pathname } = url.parse(req.url)
    pathname = decodeURIComponent(pathname)
    let abspath = path.join(dirurl, pathname)
    // console.log(abspath)

    // fs.stat(abspath, (err, ))
    try {
      let statObj = await fs.stat(abspath)
      // 判断是文件还是目录
      if (statObj.isFile()){
        this.FileHandle(req, res, abspath)
      } else {
        // 文件读取
        let dirs = await fs.readdir(abspath)
        dirs = dirs.map(item => {
          return {
            path: path.join(pathname, item),
            dirs: item
          }
        })
        // console.log(dirs)
        let renderFile = promisify(ejs.renderFile)

        let parentpath = path.dirname(pathname)

        // 文件写会html 拼接模块，以html格式展示出来 模板文件处理的结果都交给了ret
        let ret = await renderFile(path.resolve(__dirname, 'template.html'), {
          arr: dirs,
          parent: pathname == '/' ? false : true,
          parentpath: parentpath,
          title: path.basename(abspath)
        })
        res.end(ret)
      }
    } catch (err) {
      this.errorHandle(req, res, err) 
    }
  }
  // 错误处理 
  errorHandle (req, res, err) {
    console.log(err)
    res.statusCode = 404
    res.setHeader('Content-type', 'text/html;charset=utf-8')
    res.end('Not Found')
  }
  // 文件处理
  FileHandle(req, res, abspath) {
    // 避免文件过大， 用可读流处理
    res.statusCode=200
    res.setHeader('Content-type', `${mime.getType(abspath)};charset=utf-8`)
    createReadStream(abspath).pipe(res)
  }
}

module.exports = Server
#! /usr/bin/env node

const { program } = require('commander')  // --help 命令的第三方包

// console.log('执行了')
// program.option('-p --port ', 'set server port 设置服务端口号')

// 配置信息
let options = {
  '-p --port <dir>': {
    'description': 'init server port',
    'example': 'cyzserver -p 3306'
  },
  '-d --directory <dir>': {
    'description': 'init server directory',
    'example': 'cyzserver -d c'
  },
}
// 展示配置信息  格式化
function formatConfig(configs, cb) {
  Object.entries(configs).forEach(([key, val]) => {
    cb(key, val)
  })
}

formatConfig(options, (cmd, val) => {
  program.option(cmd, val.description) 
})

program.on('--help', () => {
  console.log('Examples：')
  formatConfig(options, (cmd, val) => {
    console.log(val.example)
  })
})

program.name('cyzserver')  /// 重命名

// 获取版本号 
let version = require('../package.json').version
program.version(version)

let cmdConfig = program.parse(process.argv)
// console.log(cmdConfig)

let Server = require('../main.js')
new Server(cmdConfig).start()



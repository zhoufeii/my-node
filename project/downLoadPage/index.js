const koa = require('koa');
const mount = require('koa-mount');
const static = require('koa-static');
const fs = require('fs');

// TODO: 全局安装 nodemon 工具，可以实现热更新

const app = new koa();

app.use(
    static(__dirname + '/source/')  // static 中间件用于匹配静态资源
)

app.use(
    mount('/download', async (ctx, next) => {
        // ctx.body = 'hello world!'
        ctx.body = fs.readFileSync(__dirname + '/source/index.htm', 'utf-8')
    })
)

app.listen(3000);
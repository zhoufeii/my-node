const fs = require('fs');
const game = require('./commonjs/game');
const koa = require('koa');
const mount = require('koa-mount');

const app = new koa();
let wonCount = 0;   // 获胜次数
let sameAction = 0;  // 相同选项次数
let lastPlayerAction = null;   // 上一个选项
app.use(
    mount('/favicon.ico', function (ctx) {
        ctx.status = 200;
    })
)

// 在 mount 中，如果需要挂载多个中间件，可以使用 
// 将多个中间件挂载到一个新的koa实例上，
// 再将这个新的koa实例挂载到mount上这样 的方法
// 因为在 mount 上，只能挂载一个中间件！所以曲线救国

// TODO: koa中最好按照功能模块在编写中间件

const gameKoa = new koa();

app.use(
    mount('/game', gameKoa) //  将新的Koa实例挂载在mount上
)

/**
 *  在 gameKoa 中，有五个中间件，在第一个中间件初始化的时候，挂载必要的属性到ctx上
 *  0、初始化所需的数据到中间件上
 *  1、判断是否已经胜利三次（是否太强）
 *  2、判断是否连续出三个相同的选项（是否作弊）
 *  3、开始猜拳
 *  4、返回结果
 */

gameKoa.use(
    async function (ctx, next) {
        // console.log(ctx)
        const query = ctx.query;
        const playerAction = query.action;
        ctx.playerAction = playerAction || null;   // 本次选项

        await next();
    }
)

gameKoa.use(    // 1、判断是否已经胜利三次（是否太强）
    async function (ctx, next) {
        console.log('===wonCount====')
        console.log(wonCount)
        if (wonCount >= 3) {
            ctx.status = 500;
            ctx.body = '你太厉害了！';
            return;
        }

        await next();

        if (ctx.playerWin) {    // 玩家获胜，胜利次数加1
            wonCount++;
        }
    }
)

gameKoa.use(    // 2、判断是否连续出三个相同的选项（是否作弊）
    async function (ctx, next) {
        if (sameAction === 3) {
            ctx.status = 400;
            ctx.body = '你作弊了！'
            return;
        }

        await next();

        if (ctx.playerAction === lastPlayerAction) {  // 玩家选项与上次一样，相同选项次数加1
            sameAction++;
        }

        lastPlayerAction = ctx.playerAction;
    }
)

gameKoa.use(    // 3、开始猜拳
    async function (ctx, next) {
        // 1、获取用户输入

        const gameResult = game(ctx.playerAction);
        // game

        await new Promise((resolve) => {
            ctx.status = 200;
            setTimeout(() => {
                if (gameResult == 1) {
                    ctx.body = '你赢了！';
                    ctx.playerWin = true;
                } else if (gameResult == -1) {
                    ctx.body = '你输了！';
                    ctx.playerWin = false;
                } else {
                    ctx.body = '平局了！';
                    ctx.playerWin = false;
                }
                resolve(ctx.body)
            }, 200)
        })
    }
)


app.use(
    mount('/', function (ctx) {
        ctx.status = 200;
        ctx.body = fs.readFileSync(__dirname + '/index.html', 'utf-8');
    })
)


app.listen(3001);
